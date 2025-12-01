use serde::Serialize;
// use std::collections::HashMap;
use tokio_postgres::{Client, Error, NoTls};

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TableInfo {
    pub table_name: String,
    pub table_schema: String,
    pub table_comment: Option<String>,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ColumnInfo {
    pub column_name: String,
    pub data_type: String,
    pub is_nullable: String,
    pub column_default: Option<String>,
    pub column_comment: Option<String>,
    pub character_maximum_length: Option<i32>,
    pub numeric_precision: Option<i32>,
    pub numeric_scale: Option<i32>,
    pub is_primary_key: bool,
}

pub struct DatabaseMetadata {
    client: Client,
}

impl DatabaseMetadata {
    /// 创建数据库连接
    pub async fn connect(connection_string: &str) -> Result<Self, Error> {
        let (client, connection) = tokio_postgres::connect(connection_string, NoTls).await?;

        // 在后台处理连接
        tokio::spawn(async move {
            if let Err(e) = connection.await {
                eprintln!("数据库连接错误: {}", e);
            }
        });

        Ok(DatabaseMetadata { client })
    }

    /// 测试数据库连接
    pub async fn test_connection(&self) -> Result<String, Error> {
        let row = self.client.query_one("SELECT version()", &[]).await?;
        let version: String = row.get(0);
        Ok(format!("数据库连接成功! 版本: {}", version))
    }

    /// 获取所有表的信息（包括注释）
    pub async fn get_all_tables(&self) -> Result<Vec<TableInfo>, Error> {
        let query = r#"
            SELECT 
                t.table_name,
                t.table_schema,
                pgd.description as table_comment
            FROM 
                information_schema.tables t
            LEFT JOIN 
                pg_catalog.pg_class c ON c.relname = t.table_name
            LEFT JOIN 
                pg_catalog.pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.table_schema
            LEFT JOIN 
                pg_catalog.pg_description pgd ON pgd.objoid = c.oid AND pgd.objsubid = 0
            WHERE 
                t.table_schema NOT IN ('information_schema', 'pg_catalog')
                AND t.table_type = 'BASE TABLE'
            ORDER BY 
                t.table_schema, t.table_name;
        "#;

        let rows = self.client.query(query, &[]).await?;

        let tables = rows
            .iter()
            .map(|row| TableInfo {
                table_name: row.get("table_name"),
                table_schema: row.get("table_schema"),
                table_comment: row.get("table_comment"),
            })
            .collect();

        Ok(tables)
    }

    /// 获取指定表的所有字段信息（包含主键信息）
    pub async fn get_table_columns(
        &self,
        schema: &str,
        table_name: &str,
    ) -> Result<Vec<ColumnInfo>, Error> {
        // 首先获取所有字段信息
        let columns_query = r#"
        SELECT 
            c.column_name,
            c.data_type,
            c.is_nullable,
            c.column_default,
            pgd.description as column_comment,
            c.character_maximum_length,
            c.numeric_precision,
            c.numeric_scale
        FROM 
            information_schema.columns c
        LEFT JOIN 
            pg_catalog.pg_statio_all_tables st ON st.schemaname = c.table_schema AND st.relname = c.table_name
        LEFT JOIN 
            pg_catalog.pg_description pgd ON pgd.objoid = st.relid AND pgd.objsubid = c.ordinal_position
        WHERE 
            c.table_schema = $1 
            AND c.table_name = $2
        ORDER BY 
            c.ordinal_position;
    "#;

        // 然后获取主键信息
        let primary_keys_query = r#"
        SELECT 
            kcu.column_name
        FROM 
            information_schema.table_constraints tc
        JOIN 
            information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        WHERE 
            tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_schema = $1
            AND tc.table_name = $2;
    "#;

        let columns_rows = self
            .client
            .query(columns_query, &[&schema, &table_name])
            .await?;
        let primary_keys_rows = self
            .client
            .query(primary_keys_query, &[&schema, &table_name])
            .await?;

        // 提取主键列名
        let primary_key_columns: Vec<String> = primary_keys_rows
            .iter()
            .map(|row| row.get("column_name"))
            .collect();

        let columns = columns_rows
            .iter()
            .map(|row| {
                let column_name: String = row.get("column_name");
                let is_primary_key = primary_key_columns.contains(&column_name);

                ColumnInfo {
                    column_name,
                    data_type: row.get("data_type"),
                    is_nullable: row.get("is_nullable"),
                    column_default: row.get("column_default"),
                    column_comment: row.get("column_comment"),
                    character_maximum_length: row.get("character_maximum_length"),
                    numeric_precision: row.get("numeric_precision"),
                    numeric_scale: row.get("numeric_scale"),
                    is_primary_key,
                }
            })
            .collect();

        Ok(columns)
    }

    // /// 获取所有表和它们的字段信息
    // pub async fn get_database_schema(&self) -> Result<HashMap<String, Vec<ColumnInfo>>, Error> {
    //     let tables = self.get_all_tables().await?;
    //     let mut schema = HashMap::new();

    //     for table in tables {
    //         let full_table_name = format!("{}.{}", table.table_schema, table.table_name);
    //         let columns = self
    //             .get_table_columns(&table.table_schema, &table.table_name)
    //             .await?;
    //         schema.insert(full_table_name, columns);
    //     }

    //     Ok(schema)
    // }

    // 获取指定表的完整信息（包括表和字段信息）
    pub async fn get_table_full_info(
        &self,
        schema: &str,
        table_name: &str,
    ) -> Result<(TableInfo, Vec<ColumnInfo>), Error> {
        // 首先获取表信息
        let table_query = r#"
            SELECT
                t.table_name,
                t.table_schema,
                pgd.description as table_comment
            FROM
                information_schema.tables t
            LEFT JOIN
                pg_catalog.pg_class c ON c.relname = t.table_name
            LEFT JOIN
                pg_catalog.pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.table_schema
            LEFT JOIN
                pg_catalog.pg_description pgd ON pgd.objoid = c.oid AND pgd.objsubid = 0
            WHERE
                t.table_schema = $1
                AND t.table_name = $2;
        "#;

        let table_row = self
            .client
            .query_one(table_query, &[&schema, &table_name])
            .await?;

        let table_info = TableInfo {
            table_name: table_row.get("table_name"),
            table_schema: table_row.get("table_schema"),
            table_comment: table_row.get("table_comment"),
        };

        // 然后获取字段信息
        let columns = self.get_table_columns(schema, table_name).await?;

        Ok((table_info, columns))
    }
}

// 为Tauri命令准备的简化接口
pub struct PgMetadataService;

impl PgMetadataService {
    /// 测试连接
    pub async fn test_connection(connection_string: String) -> Result<String, String> {
        let db = DatabaseMetadata::connect(&connection_string)
            .await
            .map_err(|e| e.to_string())?;

        db.test_connection().await.map_err(|e| e.to_string())
    }

    /// 获取所有表
    pub async fn get_all_tables_api(connection_string: String) -> Result<Vec<TableInfo>, String> {
        let db = DatabaseMetadata::connect(&connection_string)
            .await
            .map_err(|e| e.to_string())?;

        db.get_all_tables().await.map_err(|e| e.to_string())
    }

    /// 获取表字段
    pub async fn get_table_columns_api(
        connection_string: String,
        schema: String,
        table_name: String,
    ) -> Result<Vec<ColumnInfo>, String> {
        let db = DatabaseMetadata::connect(&connection_string)
            .await
            .map_err(|e| e.to_string())?;

        db.get_table_columns(&schema, &table_name)
            .await
            .map_err(|e| e.to_string())
    }

    /// 获取完整数据库结构
    // pub async fn get_database_schema(
    //     connection_string: String,
    // ) -> Result<HashMap<String, Vec<ColumnInfo>>, String> {
    //     let db = DatabaseMetadata::connect(&connection_string)
    //         .await
    //         .map_err(|e| e.to_string())?;

    //     db.get_database_schema().await.map_err(|e| e.to_string())
    // }

    /// 获取表的完整信息
    pub async fn get_table_full_info(
        connection_string: String,
        schema: String,
        table_name: String,
    ) -> Result<(TableInfo, Vec<ColumnInfo>), String> {
        let db = DatabaseMetadata::connect(&connection_string)
            .await
            .map_err(|e| e.to_string())?;

        db.get_table_full_info(&schema, &table_name)
            .await
            .map_err(|e| e.to_string())
    }
}

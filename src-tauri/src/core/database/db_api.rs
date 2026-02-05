use mysql_async::prelude::*;
use mysql_async::{Conn as MysqlConn, Error as MysqlError, Opts as MysqlOpts};
use serde::Serialize;
use std::fmt;
use tokio_postgres::{Client as PgClient, Error as PgError, NoTls};

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

#[derive(Debug, Clone)]
pub enum DbType {
    PostgreSQL,
    MySQL,
}

impl fmt::Display for DbType {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            DbType::PostgreSQL => write!(f, "PostgreSQL"),
            DbType::MySQL => write!(f, "MySQL"),
        }
    }
}

pub struct DatabaseMetadata {
    db_type: DbType,
    pg_client: Option<PgClient>,
    mysql_conn: Option<MysqlConn>,
}

impl DatabaseMetadata {
    /// 创建数据库连接
    pub async fn connect(connection_string: &str) -> Result<Self, String> {
        if connection_string.starts_with("postgres://")
            || connection_string.starts_with("postgresql://")
        {
            Self::connect_postgres(connection_string).await
        } else if connection_string.starts_with("mysql://") {
            Self::connect_mysql(connection_string).await
        } else {
            Err("不支持的数据库连接字符串格式。请使用 'postgres://' 或 'mysql://' 开头".to_string())
        }
    }

    /// 连接 PostgreSQL
    async fn connect_postgres(connection_string: &str) -> Result<Self, String> {
        let (client, connection) = tokio_postgres::connect(connection_string, NoTls)
            .await
            .map_err(|e| format!("PostgreSQL 连接失败: {}", e))?;

        // 在后台处理连接
        tokio::spawn(async move {
            if let Err(e) = connection.await {
                eprintln!("PostgreSQL 连接错误: {}", e);
            }
        });

        Ok(DatabaseMetadata {
            db_type: DbType::PostgreSQL,
            pg_client: Some(client),
            mysql_conn: None,
        })
    }

    /// 连接 MySQL
    async fn connect_mysql(connection_string: &str) -> Result<Self, String> {
        let opts = MysqlOpts::from_url(connection_string)
            .map_err(|e| format!("MySQL 连接配置错误: {}", e))?;

        let conn = MysqlConn::new(opts)
            .await
            .map_err(|e| format!("MySQL 连接失败: {}", e))?;

        Ok(DatabaseMetadata {
            db_type: DbType::MySQL,
            pg_client: None,
            mysql_conn: Some(conn),
        })
    }

    /// 测试数据库连接
    pub async fn test_connection(&mut self) -> Result<String, String> {
        match self.db_type {
            DbType::PostgreSQL => {
                let client = self.pg_client.as_ref().ok_or("PostgreSQL 客户端未初始化")?;
                let row = client
                    .query_one("SELECT version()", &[])
                    .await
                    .map_err(|e| format!("PostgreSQL 查询失败: {}", e))?;
                let version: String = row.get(0);
                Ok(format!("PostgreSQL 连接成功! 版本: {}", version))
            }
            DbType::MySQL => {
                let conn = self.mysql_conn.as_mut().ok_or("MySQL 连接未初始化")?;
                let row: (String,) = conn
                    .query_first("SELECT VERSION()")
                    .await
                    .map_err(|e| format!("MySQL 查询失败: {}", e))?
                    .ok_or("未获取到版本信息")?;
                Ok(format!("MySQL 连接成功! 版本: {}", row.0))
            }
        }
    }

    /// 获取所有表的信息（包括注释）
    pub async fn get_all_tables(&mut self) -> Result<Vec<TableInfo>, String> {
        match self.db_type {
            DbType::PostgreSQL => self.get_all_tables_pg().await,
            DbType::MySQL => self.get_all_tables_mysql().await,
        }
    }

    /// PostgreSQL 获取所有表
    async fn get_all_tables_pg(&self) -> Result<Vec<TableInfo>, String> {
        let client = self.pg_client.as_ref().ok_or("PostgreSQL 客户端未初始化")?;

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

        let rows = client
            .query(query, &[])
            .await
            .map_err(|e| format!("PostgreSQL 查询失败: {}", e))?;

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

    /// MySQL 获取所有表
    async fn get_all_tables_mysql(&mut self) -> Result<Vec<TableInfo>, String> {
        let conn = self.mysql_conn.as_mut().ok_or("MySQL 连接未初始化")?;

        let query = r#"
            SELECT 
                TABLE_NAME as table_name,
                TABLE_SCHEMA as table_schema,
                TABLE_COMMENT as table_comment
            FROM 
                information_schema.TABLES
            WHERE 
                TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
                AND TABLE_TYPE = 'BASE TABLE'
            ORDER BY 
                TABLE_SCHEMA, TABLE_NAME;
        "#;

        let rows: Vec<(String, String, Option<String>)> = conn
            .query(query)
            .await
            .map_err(|e| format!("MySQL 查询失败: {}", e))?;

        let tables = rows
            .into_iter()
            .map(|(table_name, table_schema, table_comment)| TableInfo {
                table_name,
                table_schema,
                table_comment,
            })
            .collect();

        Ok(tables)
    }

    /// 获取指定表的所有字段信息（包含主键信息）
    pub async fn get_table_columns(
        &mut self,
        schema: &str,
        table_name: &str,
    ) -> Result<Vec<ColumnInfo>, String> {
        match self.db_type {
            DbType::PostgreSQL => self.get_table_columns_pg(schema, table_name).await,
            DbType::MySQL => self.get_table_columns_mysql(schema, table_name).await,
        }
    }

    /// PostgreSQL 获取表字段
    async fn get_table_columns_pg(
        &self,
        schema: &str,
        table_name: &str,
    ) -> Result<Vec<ColumnInfo>, String> {
        let client = self.pg_client.as_ref().ok_or("PostgreSQL 客户端未初始化")?;

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

        let columns_rows = client
            .query(columns_query, &[&schema, &table_name])
            .await
            .map_err(|e| format!("PostgreSQL 查询字段信息失败: {}", e))?;
        let primary_keys_rows = client
            .query(primary_keys_query, &[&schema, &table_name])
            .await
            .map_err(|e| format!("PostgreSQL 查询主键信息失败: {}", e))?;

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

    /// MySQL 获取表字段
    async fn get_table_columns_mysql(
        &mut self,
        schema: &str,
        table_name: &str,
    ) -> Result<Vec<ColumnInfo>, String> {
        let conn = self.mysql_conn.as_mut().ok_or("MySQL 连接未初始化")?;

        // 查询字段信息
        let columns_query = format!(
            r#"
            SELECT 
                COLUMN_NAME as column_name,
                DATA_TYPE as data_type,
                IS_NULLABLE as is_nullable,
                COLUMN_DEFAULT as column_default,
                COLUMN_COMMENT as column_comment,
                CHARACTER_MAXIMUM_LENGTH as character_maximum_length,
                NUMERIC_PRECISION as numeric_precision,
                NUMERIC_SCALE as numeric_scale,
                COLUMN_KEY as column_key
            FROM 
                information_schema.COLUMNS
            WHERE 
                TABLE_SCHEMA = '{}'
                AND TABLE_NAME = '{}'
            ORDER BY 
                ORDINAL_POSITION;
            "#,
            schema, table_name
        );

        let rows: Vec<(
            String,
            String,
            String,
            Option<String>,
            Option<String>,
            Option<i32>,
            Option<i32>,
            Option<i32>,
            String,
        )> = conn
            .query(&columns_query)
            .await
            .map_err(|e| format!("MySQL 查询字段信息失败: {}", e))?;

        let columns = rows
            .into_iter()
            .map(
                |(
                    column_name,
                    data_type,
                    is_nullable,
                    column_default,
                    column_comment,
                    character_maximum_length,
                    numeric_precision,
                    numeric_scale,
                    column_key,
                )| {
                    let is_primary_key = column_key == "PRI";

                    ColumnInfo {
                        column_name,
                        data_type,
                        is_nullable,
                        column_default,
                        column_comment,
                        character_maximum_length,
                        numeric_precision,
                        numeric_scale,
                        is_primary_key,
                    }
                },
            )
            .collect();

        Ok(columns)
    }

    // 获取指定表的完整信息（包括表和字段信息）
    pub async fn get_table_full_info(
        &mut self,
        schema: &str,
        table_name: &str,
    ) -> Result<(TableInfo, Vec<ColumnInfo>), String> {
        match self.db_type {
            DbType::PostgreSQL => self.get_table_full_info_pg(schema, table_name).await,
            DbType::MySQL => self.get_table_full_info_mysql(schema, table_name).await,
        }
    }

    /// PostgreSQL 获取表的完整信息
    async fn get_table_full_info_pg(
        &self,
        schema: &str,
        table_name: &str,
    ) -> Result<(TableInfo, Vec<ColumnInfo>), String> {
        let client = self.pg_client.as_ref().ok_or("PostgreSQL 客户端未初始化")?;

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

        let table_row = client
            .query_one(table_query, &[&schema, &table_name])
            .await
            .map_err(|e| format!("PostgreSQL 查询表信息失败: {}", e))?;

        let table_info = TableInfo {
            table_name: table_row.get("table_name"),
            table_schema: table_row.get("table_schema"),
            table_comment: table_row.get("table_comment"),
        };

        // 然后获取字段信息
        let columns = self.get_table_columns_pg(schema, table_name).await?;

        Ok((table_info, columns))
    }

    /// MySQL 获取表的完整信息
    async fn get_table_full_info_mysql(
        &mut self,
        schema: &str,
        table_name: &str,
    ) -> Result<(TableInfo, Vec<ColumnInfo>), String> {
        let conn = self.mysql_conn.as_mut().ok_or("MySQL 连接未初始化")?;

        // 查询表信息
        let table_query = format!(
            r#"
            SELECT 
                TABLE_NAME as table_name,
                TABLE_SCHEMA as table_schema,
                TABLE_COMMENT as table_comment
            FROM 
                information_schema.TABLES
            WHERE 
                TABLE_SCHEMA = '{}'
                AND TABLE_NAME = '{}';
            "#,
            schema, table_name
        );

        let rows: Vec<(String, String, Option<String>)> = conn
            .query(&table_query)
            .await
            .map_err(|e| format!("MySQL 查询表信息失败: {}", e))?;

        let row = rows
            .into_iter()
            .next()
            .ok_or_else(|| format!("表 {}.{} 不存在", schema, table_name))?;

        let table_info = TableInfo {
            table_name: row.0,
            table_schema: row.1,
            table_comment: row.2,
        };

        // 获取字段信息
        let columns = self.get_table_columns_mysql(schema, table_name).await?;

        Ok((table_info, columns))
    }

    /// 关闭连接
    pub async fn close(&mut self) -> Result<(), String> {
        match self.db_type {
            DbType::MySQL => {
                if let Some(conn) = self.mysql_conn.take() {
                    conn.disconnect()
                        .await
                        .map_err(|e| format!("MySQL 连接关闭失败: {}", e))?;
                }
            }
            DbType::PostgreSQL => {
                // PostgreSQL 连接会自动管理
                self.pg_client = None;
            }
        }
        Ok(())
    }
}

// 为Tauri命令准备的简化接口
pub struct DbMetadataService;
impl DbMetadataService {
    /// 测试连接
    pub async fn test_connection(connection_string: String) -> Result<String, String> {
        let mut db = DatabaseMetadata::connect(&connection_string).await?;
        db.test_connection().await
    }

    /// 获取所有表
    pub async fn get_all_tables_api(connection_string: String) -> Result<Vec<TableInfo>, String> {
        let mut db = DatabaseMetadata::connect(&connection_string).await?;
        let result = db.get_all_tables().await;
        db.close().await.ok(); // 忽略关闭错误
        result
    }

    /// 获取表字段
    pub async fn get_table_columns_api(
        connection_string: String,
        schema: String,
        table_name: String,
    ) -> Result<Vec<ColumnInfo>, String> {
        let mut db = DatabaseMetadata::connect(&connection_string).await?;
        let result = db.get_table_columns(&schema, &table_name).await;
        db.close().await.ok(); // 忽略关闭错误
        result
    }

    /// 获取表的完整信息
    pub async fn get_table_full_info(
        connection_string: String,
        schema: String,
        table_name: String,
    ) -> Result<(TableInfo, Vec<ColumnInfo>), String> {
        let mut db = DatabaseMetadata::connect(&connection_string).await?;
        let result = db.get_table_full_info(&schema, &table_name).await;
        db.close().await.ok(); // 忽略关闭错误
        result
    }
}

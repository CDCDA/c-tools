use chrono::Utc;
use hmac::{Hmac, Mac};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use sha2::{Digest, Sha256};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::command;

// 响应结构体
#[derive(Deserialize, Debug)]
struct TmtResponse {
    Response: TmtResponseBody,
}

#[derive(Deserialize, Debug)]
struct TmtResponseBody {
    TargetText: Option<String>,
    Error: Option<TmtError>,
}

#[derive(Deserialize, Debug)]
struct TmtError {
    Message: String,
}

#[command]
pub async fn translate_text(
    text: String,
    source: String,
    target: String,
) -> Result<String, String> {
    // eprintln!("translate_text: {:?}", (text, source, target));
    let secret_id = "AKIDyEJLKcmiRwKYaQ3iDVDi0Ociqpb9g7b9";
    let secret_key = "Xr0WqtlPp6A0e4HLBtOgV7XkjU1Wq10m";

    let host = "tmt.tencentcloudapi.com";
    let service = "tmt";
    let region = "ap-shanghai";
    let action = "TextTranslate";
    let version = "2018-03-21";

    // 1. 准备请求体
    let payload_json = json!({
        "SourceText": text,
        "Source": source,
        "Target": target,
        "ProjectId": 0
    });
    let payload = payload_json.to_string();

    // 2. 准备时间戳
    let now = Utc::now();
    let timestamp = now.timestamp();
    let date = now.format("%Y-%m-%d").to_string();

    // 3. 拼接规范请求串 (Canonical Request)
    let http_request_method = "POST";
    let canonical_uri = "/";
    let canonical_query_string = "";
    let canonical_headers = format!(
        "content-type:application/json; charset=utf-8\nhost:{}\n",
        host
    );
    let signed_headers = "content-type;host";
    let hashed_request_payload = hex::encode(Sha256::digest(payload.as_bytes()));
    let canonical_request = format!(
        "{}\n{}\n{}\n{}\n{}\n{}",
        http_request_method,
        canonical_uri,
        canonical_query_string,
        canonical_headers,
        signed_headers,
        hashed_request_payload
    );

    // 4. 拼接待签名字符串 (String to Sign)
    let algorithm = "TC3-HMAC-SHA256";
    let credential_scope = format!("{}/{}/tc3_request", date, service);
    let hashed_canonical_request = hex::encode(Sha256::digest(canonical_request.as_bytes()));
    let string_to_sign = format!(
        "{}\n{}\n{}\n{}",
        algorithm, timestamp, credential_scope, hashed_canonical_request
    );

    // 5. 计算签名 (Signature)
    type HmacSha256 = Hmac<Sha256>;
    let k_date = hmac_sha256(format!("TC3{}", secret_key).as_bytes(), date.as_bytes());
    let k_service = hmac_sha256(&k_date, service.as_bytes());
    let k_signing = hmac_sha256(&k_service, "tc3_request".as_bytes());
    let signature = hex::encode(hmac_sha256(&k_signing, string_to_sign.as_bytes()));

    // 6. 拼接 Authorization 头
    let authorization = format!(
        "{} Credential={}/{}, SignedHeaders={}, Signature={}",
        algorithm, secret_id, credential_scope, signed_headers, signature
    );

    // 7. 发送请求
    let client = Client::new();
    let resp = client
        .post(format!("https://{}", host))
        .header("Authorization", authorization)
        .header("Content-Type", "application/json; charset=utf-8")
        .header("Host", host)
        .header("X-TC-Action", action)
        .header("X-TC-Version", version)
        .header("X-TC-Timestamp", timestamp.to_string())
        .header("X-TC-Region", region)
        .body(payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let resp_json: TmtResponse = resp.json().await.map_err(|e| e.to_string())?;

    if let Some(err) = resp_json.Response.Error {
        return Err(format!("腾讯云错误: {}", err.Message));
    }

    match resp_json.Response.TargetText {
        Some(txt) => Ok(txt),
        None => Err("未返回翻译结果".into()),
    }
}

// 辅助函数：HMAC-SHA256
pub fn hmac_sha256(key: &[u8], message: &[u8]) -> Vec<u8> {
    let mut mac = Hmac::<Sha256>::new_from_slice(key).expect("HMAC can take key of any size");
    mac.update(message);
    mac.finalize().into_bytes().to_vec()
}

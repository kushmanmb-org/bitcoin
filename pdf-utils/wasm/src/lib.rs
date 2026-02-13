use wasm_bindgen::prelude::*;
use web_sys::console;

/// Initialize the WASM module
/// This function is called when the module is loaded
#[wasm_bindgen(start)]
pub fn init() {
    // Set panic hook for better error messages in development
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
    
    console::log_1(&"Bitcoin PDF Utils WASM module initialized".into());
}

/// Generate a simple greeting message
/// This is a placeholder function demonstrating WASM functionality
#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! Bitcoin PDF Utils is ready.", name)
}

/// Placeholder for PDF generation functionality
/// Future implementation will handle Bitcoin transaction PDFs
#[wasm_bindgen]
pub fn generate_bitcoin_transaction_pdf(transaction_id: &str) -> Result<String, JsValue> {
    // Security: Validate input to prevent injection attacks
    if transaction_id.is_empty() {
        return Err(JsValue::from_str("Transaction ID cannot be empty"));
    }
    
    if transaction_id.len() > 64 {
        return Err(JsValue::from_str("Transaction ID too long"));
    }
    
    // Validate that transaction ID contains only valid hex characters
    if !transaction_id.chars().all(|c| c.is_ascii_hexdigit()) {
        return Err(JsValue::from_str("Transaction ID must contain only hexadecimal characters"));
    }
    
    Ok(format!("PDF generation requested for transaction: {}", transaction_id))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_greet() {
        let result = greet("Alice");
        assert!(result.contains("Alice"));
        assert!(result.contains("Bitcoin PDF Utils"));
    }

    #[test]
    fn test_generate_pdf_valid_tx() {
        let result = generate_bitcoin_transaction_pdf("abc123");
        assert!(result.is_ok());
    }

    #[test]
    fn test_generate_pdf_empty_tx() {
        let result = generate_bitcoin_transaction_pdf("");
        assert!(result.is_err());
    }

    #[test]
    fn test_generate_pdf_invalid_chars() {
        let result = generate_bitcoin_transaction_pdf("invalid<script>");
        assert!(result.is_err());
    }

    #[test]
    fn test_generate_pdf_too_long() {
        let long_id = "a".repeat(65);
        let result = generate_bitcoin_transaction_pdf(&long_id);
        assert!(result.is_err());
    }
}

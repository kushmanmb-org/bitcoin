/// Integration test matching the exact usage pattern from the problem statement
use zkpdf_lib::{verify_pdf_claim, PDFCircuitInput};

#[test]
fn test_problem_statement_usage() {
    // This test matches the exact usage pattern from the problem statement
    let pdf_data = b"Some content before... Important Document - This is the content we're looking for".to_vec();
    
    // Create input for PDF verification (matching problem statement)
    let input = PDFCircuitInput {
        pdf_bytes: pdf_data,
        page_number: 0,
        offset: 23,  // Offset where "Important Document" starts
        substring: "Important Document".to_string(),
    };

    // Verify PDF (matching problem statement)
    let result = verify_pdf_claim(input).expect("Verification should succeed");
    
    // Assert verification succeeded
    assert!(result.verified, "PDF verification should succeed");
    assert_eq!(result.substring, "Important Document");
    assert_eq!(result.page_number, 0);
    assert_eq!(result.offset, 23);
}

#[test]
fn test_problem_statement_exact_offset() {
    // Test with exact offset 100 as shown in problem statement
    let mut pdf_data = vec![0u8; 100];
    pdf_data.extend_from_slice(b"Important Document");
    
    let input = PDFCircuitInput {
        pdf_bytes: pdf_data,
        page_number: 0,
        offset: 100,
        substring: "Important Document".to_string(),
    };

    let result = verify_pdf_claim(input).expect("Verification should succeed");
    
    assert!(result.verified, "PDF verification at offset 100 should succeed");
}

#[test]
fn test_multiple_verifications() {
    // Test that we can perform multiple verifications
    let pdf_data = b"Header - Important Document - Footer".to_vec();
    
    // First verification
    let input1 = PDFCircuitInput {
        pdf_bytes: pdf_data.clone(),
        page_number: 0,
        offset: 0,
        substring: "Header".to_string(),
    };
    let result1 = verify_pdf_claim(input1).unwrap();
    assert!(result1.verified);
    
    // Second verification
    let input2 = PDFCircuitInput {
        pdf_bytes: pdf_data.clone(),
        page_number: 0,
        offset: 9,
        substring: "Important Document".to_string(),
    };
    let result2 = verify_pdf_claim(input2).unwrap();
    assert!(result2.verified);
    
    // Third verification
    let input3 = PDFCircuitInput {
        pdf_bytes: pdf_data,
        page_number: 0,
        offset: 30,
        substring: "Footer".to_string(),
    };
    let result3 = verify_pdf_claim(input3).unwrap();
    assert!(result3.verified);
}

#[test]
fn test_verification_with_result_operator() {
    // Test using the ? operator as shown in problem statement
    fn verify_document() -> Result<(), Box<dyn std::error::Error>> {
        let pdf_data = vec![b'A'; 150];
        let mut full_data = pdf_data;
        full_data.extend_from_slice(b"Important Document");
        
        let input = PDFCircuitInput {
            pdf_bytes: full_data,
            page_number: 0,
            offset: 150,
            substring: "Important Document".to_string(),
        };
        
        let result = verify_pdf_claim(input)?;
        assert!(result.verified);
        Ok(())
    }
    
    // Should not panic and should succeed
    verify_document().expect("Verification with ? operator should work");
}

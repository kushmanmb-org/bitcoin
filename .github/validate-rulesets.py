#!/usr/bin/env python3
"""
Validate GitHub Rulesets and Security Configuration

This script validates the ruleset JSON files and security configuration
to ensure they follow best practices and are properly formatted.
"""

import json
import sys
import os
from pathlib import Path
from typing import Dict, List, Any

def validate_json_file(filepath: Path) -> tuple[bool, str]:
    """Validate that a file contains valid JSON."""
    try:
        with open(filepath, 'r') as f:
            json.load(f)
        return True, "Valid JSON"
    except json.JSONDecodeError as e:
        return False, f"Invalid JSON: {e}"
    except Exception as e:
        return False, f"Error reading file: {e}"

def validate_ruleset_structure(ruleset: Dict[str, Any]) -> List[str]:
    """Validate the structure of a ruleset."""
    issues = []
    
    # Required fields
    required_fields = ['name', 'target', 'enforcement', 'rules']
    for field in required_fields:
        if field not in ruleset:
            issues.append(f"Missing required field: {field}")
    
    # Validate target
    if 'target' in ruleset and ruleset['target'] not in ['branch', 'tag']:
        issues.append(f"Invalid target: {ruleset['target']}. Must be 'branch' or 'tag'")
    
    # Validate enforcement
    if 'enforcement' in ruleset and ruleset['enforcement'] not in ['active', 'evaluate', 'disabled']:
        issues.append(f"Invalid enforcement: {ruleset['enforcement']}")
    
    # Validate rules array
    if 'rules' in ruleset:
        if not isinstance(ruleset['rules'], list):
            issues.append("Rules must be an array")
        elif len(ruleset['rules']) == 0:
            issues.append("Rules array is empty")
    
    return issues

def validate_security_checks(ruleset: Dict[str, Any]) -> List[str]:
    """Validate security-related checks in rulesets."""
    issues = []
    
    # Check if ruleset includes security status checks
    if 'rules' in ruleset:
        has_status_checks = False
        for rule in ruleset['rules']:
            if rule.get('type') == 'required_status_checks':
                has_status_checks = True
                # Check for security contexts
                params = rule.get('parameters', {})
                checks = params.get('required_status_checks', [])
                
                security_contexts = ['CodeQL', 'security-scan', 'security/codeql']
                has_security = any(
                    any(ctx.lower() in check.get('context', '').lower() for ctx in security_contexts)
                    for check in checks
                )
                
                if not has_security and 'main' in ruleset.get('name', '').lower():
                    issues.append("Main branch protection should include security checks")
        
        if not has_status_checks and ruleset.get('target') == 'branch':
            issues.append("Branch protection should include status checks")
    
    return issues

def validate_branch_protection(ruleset: Dict[str, Any]) -> List[str]:
    """Validate branch protection best practices."""
    issues = []
    
    if ruleset.get('target') != 'branch':
        return issues
    
    name = ruleset.get('name', '').lower()
    is_main = 'main' in name or 'master' in name
    is_release = 'release' in name
    
    # Check for critical protection rules
    rule_types = {rule.get('type') for rule in ruleset.get('rules', [])}
    
    if is_main or is_release:
        critical_rules = ['deletion', 'non_fast_forward', 'pull_request']
        missing = [rule for rule in critical_rules if rule not in rule_types]
        if missing:
            issues.append(f"Critical protection missing for {name}: {', '.join(missing)}")
        
        # Check review requirements
        for rule in ruleset.get('rules', []):
            if rule.get('type') == 'pull_request':
                params = rule.get('parameters', {})
                review_count = params.get('required_approving_review_count', 0)
                if is_main and review_count < 2:
                    issues.append("Main branch should require at least 2 approving reviews")
    
    return issues

def main():
    """Main validation function."""
    script_dir = Path(__file__).parent
    rulesets_dir = script_dir / 'rulesets'
    
    if not rulesets_dir.exists():
        print(f"Error: Rulesets directory not found: {rulesets_dir}")
        return 1
    
    print("Validating GitHub Rulesets...")
    print("=" * 60)
    
    all_valid = True
    ruleset_files = list(rulesets_dir.glob('*.json'))
    
    if not ruleset_files:
        print("Warning: No ruleset JSON files found")
        return 0
    
    for filepath in ruleset_files:
        print(f"\nValidating: {filepath.name}")
        print("-" * 60)
        
        # Validate JSON syntax
        is_valid, message = validate_json_file(filepath)
        if not is_valid:
            print(f"❌ {message}")
            all_valid = False
            continue
        
        # Load and validate structure
        with open(filepath, 'r') as f:
            ruleset = json.load(f)
        
        issues = []
        issues.extend(validate_ruleset_structure(ruleset))
        issues.extend(validate_security_checks(ruleset))
        issues.extend(validate_branch_protection(ruleset))
        
        if issues:
            all_valid = False
            for issue in issues:
                print(f"⚠️  {issue}")
        else:
            print("✅ Ruleset is valid")
    
    print("\n" + "=" * 60)
    if all_valid:
        print("✅ All rulesets validated successfully")
        return 0
    else:
        print("❌ Validation failed - please fix the issues above")
        return 1

if __name__ == '__main__':
    sys.exit(main())

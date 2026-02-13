#!/usr/bin/env python3
"""
Validate GitHub Actions workflow files for security best practices.
"""

import os
import re
import sys
import yaml
from pathlib import Path
from typing import List, Tuple, Dict

def find_workflow_files(directory: str = ".github/workflows") -> List[Path]:
    """Find all YAML workflow files."""
    workflow_dir = Path(directory)
    if not workflow_dir.exists():
        print(f"❌ Workflow directory not found: {directory}")
        return []
    
    return list(workflow_dir.glob("*.yml")) + list(workflow_dir.glob("*.yaml"))

def check_permissions(workflow: Dict) -> List[str]:
    """Check if workflow has minimal permissions configured."""
    issues = []
    
    if "permissions" not in workflow:
        issues.append("⚠️  No 'permissions' field defined - defaults to all")
    else:
        perms = workflow["permissions"]
        if isinstance(perms, str) and perms == "write-all":
            issues.append("❌ Uses 'permissions: write-all' - too permissive")
        elif isinstance(perms, dict):
            # Check for overly broad permissions
            risky_perms = ["contents: write", "packages: write", "deployments: write"]
            for perm, value in perms.items():
                if value == "write" and perm in ["contents", "packages", "deployments"]:
                    issues.append(f"⚠️  Has write permission for '{perm}' - ensure necessary")
    
    return issues

def check_actions_pinned(content: str, filepath: str) -> List[str]:
    """Check if actions are pinned to SHA."""
    issues = []
    
    # Find all uses: statements
    uses_pattern = re.compile(r'uses:\s+([^@\s]+)@([^\s]+)')
    
    for match in uses_pattern.finditer(content):
        action = match.group(1)
        version = match.group(2)
        
        # Skip local actions
        if action.startswith('./'):
            continue
        
        # Check if version is a SHA (40 hex characters)
        if not re.match(r'^[0-9a-f]{40}$', version):
            issues.append(f"⚠️  Action '{action}' not pinned to SHA (using '{version}')")
    
    return issues

def check_pull_request_target(workflow: Dict, filepath: str) -> List[str]:
    """Check for unsafe use of pull_request_target."""
    issues = []
    
    if "on" in workflow:
        triggers = workflow["on"]
        if isinstance(triggers, dict) and "pull_request_target" in triggers:
            issues.append("⚠️  Uses 'pull_request_target' - ensure proper isolation")
            
            # Check if it checks out PR code
            jobs = workflow.get("jobs", {})
            for job_name, job_config in jobs.items():
                if isinstance(job_config, dict):
                    steps = job_config.get("steps", [])
                    for step in steps:
                        if isinstance(step, dict):
                            uses = step.get("uses", "")
                            if "actions/checkout" in uses:
                                with_config = step.get("with", {})
                                ref = with_config.get("ref", "")
                                if "github.event.pull_request" in str(ref):
                                    issues.append(f"❌ Job '{job_name}' checks out untrusted PR code with pull_request_target!")
    
    return issues

def check_secrets_handling(content: str) -> List[str]:
    """Check for potential secret exposure."""
    issues = []
    
    # Look for secrets in run commands (potential exposure)
    if re.search(r'run:.*secrets\.[A-Z_]+[^}]', content):
        issues.append("⚠️  Secrets may be passed directly to commands - use env vars instead")
    
    # Check for hardcoded credentials patterns
    patterns = [
        (r'password\s*[:=]\s*["\'][^"\']+["\']', "potential hardcoded password"),
        (r'api[_-]?key\s*[:=]\s*["\'][^"\']+["\']', "potential hardcoded API key"),
        (r'token\s*[:=]\s*["\'][^"\']+["\']', "potential hardcoded token"),
    ]
    
    for pattern, desc in patterns:
        if re.search(pattern, content, re.IGNORECASE):
            issues.append(f"⚠️  Found {desc} - verify not hardcoded")
    
    return issues

def check_input_validation(workflow: Dict) -> List[str]:
    """Check if workflow inputs are validated."""
    issues = []
    
    if "on" in workflow:
        triggers = workflow["on"]
        if isinstance(triggers, dict) and "workflow_dispatch" in triggers:
            dispatch_config = triggers["workflow_dispatch"]
            if isinstance(dispatch_config, dict) and "inputs" in dispatch_config:
                inputs = dispatch_config["inputs"]
                
                # Check if there are jobs that validate inputs
                jobs = workflow.get("jobs", {})
                has_validation = False
                
                for job_name, job_config in jobs.items():
                    if isinstance(job_config, dict):
                        steps = job_config.get("steps", [])
                        for step in steps:
                            if isinstance(step, dict):
                                name = step.get("name", "").lower()
                                if "validat" in name or "check" in name:
                                    has_validation = True
                                    break
                
                if not has_validation and len(inputs) > 0:
                    issues.append("⚠️  Has workflow_dispatch inputs but no validation step found")
    
    return issues

def check_runner_labels(workflow: Dict) -> List[str]:
    """Check runner configuration."""
    issues = []
    
    jobs = workflow.get("jobs", {})
    for job_name, job_config in jobs.items():
        if isinstance(job_config, dict):
            runs_on = job_config.get("runs-on", "")
            
            # Convert to list if string
            if isinstance(runs_on, str):
                runs_on = [runs_on]
            
            # Check for self-hosted without additional security labels
            if "self-hosted" in runs_on:
                security_labels = {"ephemeral", "isolated", "secure", "trusted"}
                if not any(label in runs_on for label in security_labels):
                    issues.append(f"⚠️  Job '{job_name}' uses self-hosted without security labels")
    
    return issues

def validate_workflow(filepath: Path) -> Tuple[str, List[str]]:
    """Validate a single workflow file."""
    print(f"\n🔍 Checking {filepath.name}...")
    
    all_issues = []
    
    try:
        # Read file
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Parse YAML
        workflow = yaml.safe_load(content)
        
        if not workflow:
            return filepath.name, ["❌ Empty or invalid workflow file"]
        
        # Run checks
        all_issues.extend(check_permissions(workflow))
        all_issues.extend(check_actions_pinned(content, str(filepath)))
        all_issues.extend(check_pull_request_target(workflow, str(filepath)))
        all_issues.extend(check_secrets_handling(content))
        all_issues.extend(check_input_validation(workflow))
        all_issues.extend(check_runner_labels(workflow))
        
        if not all_issues:
            print(f"  ✅ No issues found")
        else:
            for issue in all_issues:
                print(f"  {issue}")
        
        return filepath.name, all_issues
        
    except yaml.YAMLError as e:
        error = f"❌ YAML parsing error: {e}"
        print(f"  {error}")
        return filepath.name, [error]
    except Exception as e:
        error = f"❌ Error: {e}"
        print(f"  {error}")
        return filepath.name, [error]

def main():
    """Main validation function."""
    print("=" * 70)
    print("GitHub Actions Workflow Security Validator")
    print("=" * 70)
    
    # Find workflow files
    workflows = find_workflow_files()
    
    if not workflows:
        print("❌ No workflow files found")
        return 1
    
    print(f"\nFound {len(workflows)} workflow file(s)")
    
    # Validate each workflow
    results = []
    for workflow_file in workflows:
        name, issues = validate_workflow(workflow_file)
        results.append((name, issues))
    
    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    
    total_issues = sum(len(issues) for _, issues in results)
    
    for name, issues in results:
        status = "✅" if not issues else "⚠️" if any("⚠️" in i for i in issues) else "❌"
        print(f"{status} {name}: {len(issues)} issue(s)")
    
    print(f"\nTotal: {total_issues} issue(s) across {len(workflows)} file(s)")
    
    if total_issues > 0:
        print("\n⚠️  Review the issues above and address security concerns")
        return 1
    else:
        print("\n✅ All workflows passed security checks!")
        return 0

if __name__ == "__main__":
    sys.exit(main())

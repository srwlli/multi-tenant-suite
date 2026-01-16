# My Guide - Business Dashboard Tools Reference

Quick reference for all available tools and commands in the Business Dashboard project.

## Documentation Tools

### Foundation Documentation
- `/generate-docs` - Generate foundation docs (API, SCHEMA, COMPONENTS, ARCHITECTURE, README)
- `mcp_coderef-workflow_generate_foundation_docs` - Generate all foundation documents with code intelligence
- `mcp_coderef-workflow_generate_individual_doc` - Generate single document (readme, architecture, api, components, schema, user-guide)

### Standards & Quality
- `/establish-standards` - Extract UI/UX/behavior patterns from codebase (run once per project)
- `mcp_coderef-workflow_establish_standards` - Scan codebase and create standards documents
- `mcp_coderef-workflow_audit_codebase` - Audit codebase for standards violations
- `mcp_coderef-workflow_check_consistency` - Quality gate for pre-commit checks

### User Documentation
- `/generate-user-docs` - Generate user-facing docs (my-guide, USER-GUIDE, FEATURES, quickref)
- `mcp_coderef-workflow_generate_quickref_interactive` - Interactive quickref generator

## Planning & Workflow Tools

### Implementation Planning
- `mcp_coderef-workflow_analyze_project_for_planning` - Analyze project for planning workflows
- `mcp_coderef-workflow_gather_context` - Gather feature requirements and save to context.json
- `mcp_coderef-workflow_create_plan` - Create implementation plan from context and analysis
- `mcp_coderef-workflow_validate_implementation_plan` - Validate plan against quality checklist
- `mcp_coderef-workflow_generate_plan_review_report` - Generate human-readable review report

### Plan Execution
- `mcp_coderef-workflow_execute_plan` - Generate TodoWrite task list from plan.json
- `mcp_coderef-workflow_update_task_status` - Update task status in plan.json
- `mcp_coderef-workflow_audit_plans` - Audit all plans for health and issues

## Changelog & Versioning

- `mcp_coderef-workflow_get_changelog` - Get project changelog with structured change history
- `mcp_coderef-workflow_add_changelog_entry` - Add entry to changelog
- `mcp_coderef-workflow_update_changelog` - Agentic workflow to update changelog from context
- `mcp_coderef-workflow_update_all_documentation` - Update README, CLAUDE, CHANGELOG after feature completion

## Workorder Tracking

- `mcp_coderef-workflow_log_workorder` - Log workorder entry to global log
- `mcp_coderef-workflow_get_workorder_log` - Read and query workorder log
- `mcp_coderef-workflow_generate_handoff_context` - Generate agent handoff context files

## Multi-Agent Coordination

- `mcp_coderef-workflow_generate_agent_communication` - Generate communication.json for multi-agent setup
- `mcp_coderef-workflow_assign_agent_task` - Assign task to agent with conflict detection
- `mcp_coderef-workflow_verify_agent_completion` - Verify agent completion with git diff checks
- `mcp_coderef-workflow_aggregate_agent_deliverables` - Aggregate metrics from multiple agents
- `mcp_coderef-workflow_track_agent_status` - Track agent status across features

## Code Analysis

- `mcp_coderef-context_coderef_scan` - Scan project and discover code elements
- `mcp_coderef-context_coderef_query` - Query code relationships (calls, imports, dependencies)
- `mcp_coderef-context_coderef_impact` - Analyze impact of modifying/deleting code elements
- `mcp_coderef-context_coderef_complexity` - Get complexity metrics for code elements
- `mcp_coderef-context_coderef_patterns` - Discover code patterns and test coverage gaps

## Risk Assessment

- `mcp_coderef-workflow_assess_risk` - AI-powered risk assessment for proposed changes

## Archive & Inventory

- `mcp_coderef-workflow_archive_feature` - Archive completed features
- `mcp_coderef-workflow_generate_features_inventory` - Generate inventory of all features

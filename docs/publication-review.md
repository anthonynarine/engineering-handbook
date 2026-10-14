<!-- docs/publication-review.md — Public promotion boundaries for the engineering manual. -->
# Publication review — October 14, 2026

The handbook can be promoted as a personal engineering manual and portfolio of architecture decisions. Its breadth is useful; it should not be presented as certification that every illustrated system is deployed, secure, or production-ready.

Public material should include general build workflows, synthetic examples, responsibility maps, rationale, and explicit proposed/current-state boundaries. Lumen's AWS topology remains a design, not a deployed environment. Learning status is personal, not an assessed competency.

Location-specific source security findings were removed from the gaming chapter. Unredacted originals and original owner planning context remain in ignored `.private/` or ignored local files. Public source references are summaries, not a vulnerability inventory. Personal checkout paths were replaced by generic authorized-checkout placeholders.

Do not publish credentials, private keys, patient/customer data, internal findings, exploit reproduction details, production operational hostnames, private governance/session state, or provider configuration exports. Source and artifact scans catch selected recognizable patterns; they do not establish that prose or an image is safe. Review diagrams, project changes, logs and source references editorially before release. Do not automatically copy source-project documentation into the handbook.

Promote the static site independently of publishing the repository. No GitHub repository was created or pushed by this hardening pass. Connecting a remote requires choosing its owner/name/visibility and verifying the reviewed source snapshot. Configure required checks and provider-account MFA/access separately; repository files cannot enforce settings that have not been enabled on the hosting accounts.

Previously deployed versions may retain older published material at historical deployment URLs. Removing sensitive text from the current site does not erase provider deployment history or external caches. If restricting that older material is required, review and remove the affected historic deployments through the account's approved workflow.

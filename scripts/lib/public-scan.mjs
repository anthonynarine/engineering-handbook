// scripts/lib/public-scan.mjs — Flag concrete secret formats without printing matched values.
export function findings(text){
 const checks=[['private-key',/-{5}BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-{5}/],['aws-access-key',/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],['github-token',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],['credential-url',/https?:\/\/[^\s/@:]+:[^\s/@]+@/],['personal-checkout-path',/\/Users\/[a-zA-Z0-9_.-]+\//],['operational-host',/https?:\/\/[a-zA-Z0-9-]+\.herokuapp\.com/]];
 return checks.filter(([,pattern])=>pattern.test(text)).map(([name])=>name);
}

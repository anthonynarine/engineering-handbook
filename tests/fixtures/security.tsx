// tests/fixtures/security.tsx — Exercise the exact production renderer with hostile input.
import {createRoot} from 'react-dom/client';
import MarkdownContent from '../../src/shared/MarkdownContent';
const body=`# Renderer security fixture
[unsafe](javascript:alert(1))
[encoded](java%73cript:alert(1))
[protocol-relative](//example.com/collect)
[safe](/guide/build-manual)
<img src=x onerror="window.__securityFailure=true">
<script>window.__securityFailure=true</script>
![external](https://example.com/collect)
\`\`\`mermaid
%%{init: {'securityLevel': 'loose'}}%%
flowchart LR
 A[unsafe] --> B[test]
\`\`\`
\`\`\`mermaid
flowchart LR
 A[Safe text] --> B[Still renders]
\`\`\`
`;
createRoot(document.getElementById('root')!).render(<MarkdownContent body={body}/>);

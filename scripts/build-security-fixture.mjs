// scripts/build-security-fixture.mjs — Compile renderer fixtures outside the deploy directory.
import {build} from 'vite';
await build({base:'/__security/',build:{outDir:'.security-dist',emptyOutDir:true,rollupOptions:{input:'tests/fixtures/security.html'}}});

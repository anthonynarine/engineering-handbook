<!-- reference_sources/websockets.md — Evidence and limits for the WebSocket design guide. -->
# WebSocket guidance — 2026-10-13

Authored protocol/lifecycle guidance complements the Django Channels chapter and existing source-inspected gaming case studies. Example command and recovery sequence are proposed contracts, not claims of implemented replay or exactly-once delivery in the gaming application.

Primary references consulted:

- https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
- https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications
- https://channels.readthedocs.io/en/stable/topics/consumers.html
- https://channels.readthedocs.io/en/stable/topics/channel_layers.html
- https://channels.readthedocs.io/en/stable/topics/security.html

No socket server, identity integration, channel layer or deployment was changed or executed. Browser checks verify handbook rendering and navigation only.

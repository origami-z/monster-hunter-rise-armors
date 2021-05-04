`yarn install`

After syncing with upstream data (i.e. `*.ron`), run `node scripts/ronToJson.js` to update `/json` folder.

I want to consume the data in a React app so need JSON data. But I don't know Rust and failed to convert `ron` files using `serde_json`. So decided to go naive way of converting files using node.

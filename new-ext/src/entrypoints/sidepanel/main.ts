import App from "./App.svelte"
import "../../../src/assets/style.css"
import { mount } from "svelte"

const app = mount(App, {
  target: document.getElementById("app")!,
})

export default app

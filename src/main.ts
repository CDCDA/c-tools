import { createApp } from "vue";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./assets/styles/index.scss";
import router from "./router";
import image from "./components/image/index.vue";
import SvgIcon from "./components/svgIcon/index.vue";
import "virtual:svg-icons-register";
import pinia from "./store";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
pinia.use(piniaPluginPersistedstate)

const app = createApp(App);
app.component("c-image", image);
app.component("svg-icon", SvgIcon);
app.use(ElementPlus);
app.use(router);
app.use(pinia);
app.mount("#app");

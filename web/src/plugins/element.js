import Vue from "vue";
// 在下面的大括号中按需导入所需 Element-UI 中的组件即可
import { Autocomplete, Button, Form, FormItem, Input, Message,Radio,RadioGroup, Drawer,Avatar,MessageBox,Dialog,Tooltip,Tabs,TabPane,Upload} from "element-ui";
// 注意：导入的组件都需要使用 Vue.use() 进行注册
Vue.use(Button);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Input);
Vue.use(Radio);
Vue.use(RadioGroup);
Vue.use(Drawer);
Vue.use(Avatar);
Vue.use(Dialog);
Vue.use(Tooltip);
Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Autocomplete);
Vue.use(Upload);

Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm;

//先將VeeValidate的內容定義為變數，宣告會使用到的工具
const { Form, Field, ErrorMessage } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

//defineRule為Veevalidate提供的函式，用來定義規則
//defineRule帶兩個參數，第一個為自訂名稱，第二個為VeeValidate提供的內容
//內容對應到表單的rule
VeeValidate.defineRule('required', required);
VeeValidate.defineRule('email', email);  //email格式
VeeValidate.defineRule('min', min);
VeeValidate.defineRule('max', max);


//引入繁中
loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json');


//使用繁中
VeeValidate.configure({ // 用來做一些設定
    generateMessage: localize('zh_TW'), //啟用 locale 
});

const app = Vue.createApp({
    components: {
        VForm: Form,
        VField: Field,
        ErrorMessage: ErrorMessage,
    },
    data() {
        return {
            url: "https://vue3-course-api.hexschool.io/v2",
            path: "chingno2004",
            productData: [],
            id: "",
            cartData: {
                carts: []
            },
            isLoadingItem: "",
            user: {
                name: "",
                email: "",
                tel: "",
                address: ""
            },
            message: "",

        }
    },
    methods: {
        getProducts() {
            axios.get(`${this.url}/api/${this.path}/products`)
                .then((res) => {
                    this.productData = res.data.products;
                })
                .catch((error) => {
                    console.log(error);
                })
        },
        openModal(id) {
            this.id = id;
            this.$refs.productModal.openProductModal();
        },
        addCartList(id, qty = 1) {
            this.isLoadingItem = id
            axios.post(`${this.url}/api/${this.path}/cart`, {
                data: {
                    product_id: id,
                    qty,
                }
            })
                .then((res) => {
                    alert(res.data.message);
                    this.getCartList();
                    this.isLoadingItem = "";
                    this.$refs.productModal.closeModal();
                })
                .catch((error) => {
                    console.log(error);
                })
        },
        getCartList() {
            axios.get(`${this.url}/api/${this.path}/cart`)
                .then((res) => {
                    this.cartData = res.data.data;
                })
                .catch((error) => {
                    console.log(error);
                })
        },
        delAllCart() {
            axios.delete(`${this.url}/api/${this.path}/carts`)
                .then((res) => {
                    alert('已刪除全部購物車')
                    this.getCartList();
                })
                .catch((error) => {
                    console.log(error);
                })
        },
        delCartItem(id) {
            axios.delete(`${this.url}/api/${this.path}/cart/${id}`)
                .then((res) => {
                    alert('已刪除此商品')
                    this.getCartList();
                })
                .catch((error) => {
                    console.log(error);
                })
        },
        updatedproduct(item) {
            this.isLoadingItem = item.id
            axios.put(`${this.url}/api/${this.path}/cart/${item.id}`, {
                data: {
                    product_id: item.id,
                    qty: item.qty
                }
            })
                .then((res) => {
                    alert("購物車已更新");
                    this.getCartList();
                    this.isLoadingItem = "";
                })
                .catch((error) => {
                    console.log(error);
                })
        },
        submit() {
            axios.post(`${this.url}/api/${this.path}/order`, {
                data: {
                    user: this.user,
                    message: this.message,
                }
            })
                .then((res) => {
                    alert(res.data.message);
                    //建議使用veevalidate提供的清空欄位設定，用一般方式會在觸發一次驗證，以致會出現error messages
                    this.getCartList();
                    this.$refs.form.resetForm();

                })
                .catch((error) => {
                    console.log(error);
                    alert(error.data.message)
                })
        }
    },
    mounted() {
        this.getProducts();
        this.getCartList();
    },
});




app.component('productModal', {
    props: ['productId'],
    data() {
        return {
            url: "https://vue3-course-api.hexschool.io/v2",
            path: "chingno2004",
            productModal: "",
            tempProduct: {},
            qty: 1,

        }
    },
    watch: {  //當id變動時，會自動觸發getProduct
        productId() {
            this.getProduct();
        }
    },
    template: '#userProductModal',
    methods: {
        openProductModal() {
            this.productModal.show();
        },
        getProduct() {
            axios.get(`${this.url}/api/${this.path}/product/${this.productId}`)
                .then((res) => {
                    this.tempProduct = res.data.product;
                })
                .catch((error) => {
                    console.log(error);
                })
        },
        addCartList() {
            this.$emit('add-cart', this.tempProduct.id, this.qty);
        },
        closeModal() {
            this.productModal.hide();
            this.qty = 1;
        }

    },
    mounted() {
        this.productModal = new bootstrap.Modal(this.$refs.modal);
    }
});

app.mount("#app");
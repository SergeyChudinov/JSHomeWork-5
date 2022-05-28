class ProductItem {
  constructor(product, img='https://via.placeholder.com/200x150') {
    this.id = product.id_product;
    this.title = product.product_name;
    this.price = +product.price;
    this.img = img;
  }
}

class ProductList {
  constructor() {
    this.products = [];
  }
}

class BasketItem {
  constructor(product) {
    this.id = product.id_product;
    this.title = product.product_name;
    this.price = product.price;
    this.quantity = product.quantity;
  }
}

class Basket  {
  constructor(){
    this.items = [];
  };

  totalSum () {  // get 
    return this.items.reduce((acc, item) => acc + +item.price * item.quantity, 0)
  };

}

const app = new Vue({
  el: '#app',
  data: {
    show: false,
    basket: new Basket(),
    productList: new ProductList(),
    title: 'Hello Vue!',
    API: 'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-API/master/responses',
    userSearch: '',
    filteredProducts: [],
  },
  created: function () {
    this.fetchGoods();
    this.getItems();
  },
  methods: {
    getRequest(url){
      return new Promise((resolve, reject) => { 
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status !== 200) {
              reject('Error');
            } else {
              resolve(xhr.responseText);
            }
          }       
        };
        xhr.send();
      });
    },
    addToCart(newItem){
      this.getRequest(`${this.API}/addToBasket.json`)
        .then((data) => {
          const existingItem = this.basket.items.find(item => item.id === newItem.id);
          if(existingItem) {
            existingItem.quantity++;
          } else {
            const item = new BasketItem({
              id_product: newItem.id,
              product_name: newItem.title,
              price: newItem.price,
              quantity: 1
            });
            this.basket.items.push(item);
            console.log(this.basket.items)
          }
        })
    },
    getItems(){
      this.getRequest(`${this.API}/getBasket.json`)
        .then((data) => {
          const items = JSON.parse(data); 
          items.contents
            .map(item => new BasketItem(item))
            .forEach(item => this.addToCart(item));
        },
      (err) => { console.error(err) })
    },
    fetchGoods(){
      this.getRequest(`${this.API}/catalogData.json`)
        .then((data) => {
          this.goods = JSON.parse(data);
          for (const good of this.goods) {
            const product = new ProductItem(good);
            this.productList.products.push(product);
          }
          this.filteredProducts = this.productList.products;
        }, (err) => { 
        });
    },
    remove(baksetItem){
      this.getRequest(`${this.API}/deleteFromBasket.json`).then((data) => {
        this.basket.items = this.basket.items.filter(item => baksetItem.id !== item.id);
      })
    },
    clearBasket(){
      this.basket = new Basket();
    },
    filter() {
      let regexp = new RegExp(this.userSearch, 'i');
      this.filteredProducts = this.productList.products.filter(el => regexp.test(el.title));
    },
  }
})

// app.fetchGoods();
// app.getItems();
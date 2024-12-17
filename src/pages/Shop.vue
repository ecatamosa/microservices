<template>
  <div>
    <v-app-bar app color="transparent" flat>
      <v-toolbar-title class="white--text">Shop</v-toolbar-title>
      <v-spacer></v-spacer>
      <span class="cart-total white--text" style="margin-right: 20px">
        Cart Items: {{ totalCartItems }} | Total Price: {{ totalCartPrice }}
      </span>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-container id="cont" class="shop-container" fluid>
      <h1 class="os text-center my-4">Product List</h1>

      <!-- Display carousel if there are more than 3 products -->
      <v-row v-if="products.length > 3">
        <v-carousel cycle show-arrows :items-to-show="1">
          <v-carousel-item
            v-for="(group, index) in chunkedProducts"
            :key="index"
          >
            <v-row>
              <v-col
                v-for="product in group"
                :key="product.id"
                class="product-card mt-5 mx-5 flex justify-space-between"
                cols="3"
              >
                <v-img
                  :src="product.image"
                  alt="Product Image"
                  class="product-image"
                />
                <div class="product-details">
                  <h2>{{ product.title }}</h2>
                  <p>Quantity: {{ product.quantity }}</p>
                  <p>Price: {{ product.price }}</p>
                  <p>
                    Created At:
                    {{ new Date(product.created_at).toLocaleString() }}
                  </p>
                  <button @click="addToCart(product.id)">
                    <v-icon>mdi-cart</v-icon> Add to Cart
                  </button>
                </div>
              </v-col>
            </v-row>
          </v-carousel-item>
        </v-carousel>
      </v-row>

      <!-- Display grid of products if there are 3 or fewer -->
      <v-row v-else>
        <v-col
          v-for="product in products"
          :key="product.id"
          class="product-card mx-5"
        >
          <img :src="product.image" alt="Product Image" class="product-image" />
          <div class="product-details">
            <h2>{{ product.title }}</h2>
            <p>Quantity: {{ product.quantity }}</p>
            <p>Price: {{ product.price }}</p>
            <p>
              Created At: {{ new Date(product.created_at).toLocaleString() }}
            </p>
            <button @click="addToCart(product.id)">
              <v-icon>mdi-cart</v-icon> Add to Cart
            </button>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { supabase } from "@/lib/supabase";

export default {
  name: "ReloadableShop",
  data() {
    return {
      products: [],
      totalCartItems: 0,
      totalCartPrice: 0,
      reloadInterval: null,
    };
  },
  computed: {
    // Method to chunk products into groups of 3
    chunkedProducts() {
      let result = [];
      for (let i = 0; i < this.products.length; i += 3) {
        result.push(this.products.slice(i, i + 3));
      }
      return result;
    },
  },
  created() {
    this.fetchProducts();
    this.fetchCartSummary();
  },
  mounted() {
    this.startAutoReload();
  },
  beforeUnmount() {
    clearInterval(this.reloadInterval);
  },
  methods: {
    async fetchProducts() {
      const { data, error } = await supabase.from("products").select("*");
      if (!error) this.products = data;
    },
    async fetchCartSummary() {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      const { data, error } = await supabase
        .from("inventories")
        .select("product_id, products(price)")
        .eq("user_id", userId);
      if (!error && data) {
        this.totalCartItems = data.length;
        this.totalCartPrice = data.reduce(
          (sum, item) => sum + item.products.price,
          0
        );
      }
    },
    startAutoReload() {
      this.reloadInterval = setInterval(() => {
        this.fetchProducts();
        this.fetchCartSummary();
      }, 1000);
    },
    async addToCart(productId) {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const { data: productData, error: fetchError } = await supabase
        .from("products")
        .select("quantity, price")
        .eq("id", productId)
        .single();

      if (fetchError || !productData.quantity) return;

      const newQuantity = Math.max(productData.quantity - 1, 0);

      await supabase
        .from("products")
        .update({ quantity: newQuantity })
        .eq("id", productId);

      await supabase
        .from("inventories")
        .insert([{ user_id: userId, product_id: productId }]);

      this.fetchCartSummary();
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Comforter&display=swap");
.os {
  font-family: "Comforter", cursive;
  font-size: 5rem;
}
#cont {
  background: #1e1e1e;
  padding: 2rem;
}
.product-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
.product-details {
  padding: 10px;
}
h2 {
  font-size: 1.2em;
  margin: 0 0 10px;
}
button {
  background-color: #b1860e;
  color: #fff;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}
button:hover {
  background-color: #0056b3;
}
.cart-total {
  font-size: 1.2rem;
  font-weight: bold;
  margin-right: 20px;
}
</style>

<template>
  <div>
    <v-app-bar app color="darken-grey" flat>
      <v-toolbar-title class="white--text">Shop</v-toolbar-title>
      <v-spacer></v-spacer>
      <span class="cart-total white--text pr-5">
        Cart Items: {{ totalCartItems }} | Total Price: {{ totalCartPrice }}
      </span>
    </v-app-bar>

    <v-container id="cont" class="shop-container" fluid>
      <h1 class="os text-center my-4">Product List</h1>

      <v-row v-if="products.length > 3">
        <v-carousel cycle show-arrows :items-to-show="1" color="white">
          <v-carousel-item
            v-for="(group, index) in chunkedProducts"
            :key="index"
          >
            <v-row class="d-flex justify-center">
              <v-col
                v-for="product in group"
                :key="product.id"
                class="product-card mt-5 mx-5"
                cols="3"
              >
                <v-img :src="product.image" class="product-image" />
                <div class="product-details">
                  <h2>{{ product.title }}</h2>
                  <p>Qty: {{ product.quantity }}</p>
                  <p>Price: {{ product.price }}</p>
                  <button @click="addToCart(product.id)">
                    <v-icon>mdi-cart</v-icon> Add to Cart
                  </button>
                </div>
              </v-col>
            </v-row>
          </v-carousel-item>
        </v-carousel>
      </v-row>

      <v-row v-else>
        <v-col
          v-for="product in products"
          :key="product.id"
          class="product-card mt-5 mx-5"
          cols="3"
        >
          <v-img :src="product.image" class="product-image" />
          <div class="product-details">
            <h2>{{ product.title }}</h2>
            <p>Qty: {{ product.quantity }}</p>
            <p>Price: {{ product.price }}</p>
            <button @click="addToCart(product.id)">
              <v-icon>mdi-cart</v-icon> Add to Cart
            </button>
          </div>
        </v-col>
      </v-row>

      <h2 class="os text-center my-5">Your Cart</h2>
      <v-row class="d-flex justify-center mb-5">
        <v-col
          v-for="item in cartItems"
          :key="item.id"
          class="product-card mt-5 mx-5"
          cols="3"
        >
          <v-img :src="item.product.image" class="product-image" />
          <div class="product-details">
            <h2>{{ item.product.title }}</h2>
            <p>Price: {{ item.product.price }}</p>
            <button @click="removeFromCart(item.id, item.product.id)">
              <v-icon>mdi-delete</v-icon> Remove
            </button>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { supabase } from "@/lib/supabase";

// Reactive state variables
const products = ref([]);
const cartItems = ref([]);
const totalCartItems = ref(0);
const totalCartPrice = ref(0);

// Computed property for chunked products
const chunkedProducts = computed(() => {
  const result = [];
  for (let i = 0; i < products.value.length; i += 3) {
    result.push(products.value.slice(i, i + 3));
  }
  return result;
});

// Function to fetch products from the database
const fetchProducts = async () => {
  const { data, error } = await supabase.from("products").select("*");
  if (!error) products.value = data;
};

// Function to fetch cart items from the database
const fetchCart = async () => {
  const userId = localStorage.getItem("userId");
  const { data, error } = await supabase
    .from("inventories")
    .select("*, product:products(*)")
    .eq("user_id", userId);

  if (!error && data) {
    cartItems.value = data;
    totalCartItems.value = data.length;
    totalCartPrice.value = data.reduce(
      (sum, item) => sum + item.product.price,
      0
    );
  }
};

// Function to add a product to the cart
const addToCart = async (productId) => {
  const userId = localStorage.getItem("userId");
  const { data: productData, error } = await supabase
    .from("products")
    .select("quantity")
    .eq("id", productId)
    .single();

  if (error || productData.quantity <= 0) return;

  await supabase
    .from("products")
    .update({ quantity: productData.quantity - 1 })
    .eq("id", productId);
  await supabase
    .from("inventories")
    .insert([{ user_id: userId, product_id: productId }]);

  await fetchProducts();
  await fetchCart();
};

// Function to remove a product from the cart
const removeFromCart = async (cartId, productId) => {
  const { data: productData, error } = await supabase
    .from("products")
    .select("quantity")
    .eq("id", productId)
    .single();

  if (error) return;

  await supabase
    .from("products")
    .update({ quantity: productData.quantity + 1 })
    .eq("id", productId);
  await supabase.from("inventories").delete().eq("id", cartId);

  await fetchProducts();
  await fetchCart();
};

// Lifecycle hooks
onMounted(() => {
  fetchProducts();
  fetchCart();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Comforter&display=swap");

.os {
  font-family: "Comforter", cursive;
  font-size: 3rem;
}
#cont {
  width: 100%;
  height: 100%;
  --s: 37px; /* control the size */

  --c: #0000, #282828 0.5deg 119.5deg, #0000 120deg;
  --g1: conic-gradient(from 60deg at 56.25% calc(425% / 6), var(--c));
  --g2: conic-gradient(from 180deg at 43.75% calc(425% / 6), var(--c));
  --g3: conic-gradient(from -60deg at 50% calc(175% / 12), var(--c));
  background: var(--g1), var(--g1) var(--s) calc(1.73 * var(--s)), var(--g2),
    var(--g2) var(--s) calc(1.73 * var(--s)), var(--g3) var(--s) 0,
    var(--g3) 0 calc(1.73 * var(--s)) #1e1e1e;
  background-size: calc(2 * var(--s)) calc(3.46 * var(--s));
}

.product-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
.product-details {
  text-align: center;
}
button {
  background-color: #b1860e;
  color: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
}
button:hover {
  background-color: #d4a517;
}
</style>

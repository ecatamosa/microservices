<template>
  <v-container id="cont" class="shop-container" fluid>
    <h1 class="os text-center my-4">Product List</h1>

    <v-row>
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
          <p>Created At: {{ new Date(product.created_at).toLocaleString() }}</p>
          <button @click="addToCart(product.id)">
            <v-icon>mdi-cart</v-icon> Add to Cart
          </button>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { supabase } from "@/lib/supabase";

export default {
  name: "ReloadableShop",
  data() {
    return {
      products: [],
      reloadInterval: null,
    };
  },
  created() {
    this.fetchProducts(); // Fetch initial data
  },
  mounted() {
    this.startAutoReload(); // Start the reload timer
  },
  beforeUnmount() {
    clearInterval(this.reloadInterval); // Clean up interval to avoid memory leaks
  },
  methods: {
    async fetchProducts() {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("Error fetching products:", error);
      } else {
        this.products = data;
      }
    },
    startAutoReload() {
      this.reloadInterval = setInterval(this.fetchProducts, 1000); // Reload every 1 second
    },
    async addToCart(productId) {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("User not logged in");
        return;
      }

      // Fetch current product quantity
      const { data: productData, error: fetchError } = await supabase
        .from("products")
        .select("quantity")
        .eq("id", productId)
        .single();
      if (fetchError) {
        console.error("Error fetching product quantity:", fetchError);
        return;
      }

      const newQuantity = this.calculateNewQuantity(productData.quantity);

      // Update the product quantity
      const { error: updateError } = await supabase
        .from("products")
        .update({ quantity: newQuantity })
        .eq("id", productId);
      if (updateError) {
        console.error("Error updating product quantity:", updateError);
        return;
      }

      // Add to inventory
      const { error: insertError } = await supabase
        .from("inventories")
        .insert([{ user_id: userId, product_id: productId }]);
      if (insertError) {
        console.error("Error adding to cart:", insertError);
        return;
      }

      this.decreaseProductQuantity(productId);
    },
    calculateNewQuantity(currentQuantity) {
      return currentQuantity > 0 ? currentQuantity - 1 : 0;
    },
    decreaseProductQuantity(productId) {
      const product = this.products.find((p) => p.id === productId);
      if (product && product.quantity > 0) {
        product.quantity -= 1;
      }
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Comforter&family=Playwrite+MX+Guides&display=swap");
.os {
  font-family: "Comforter", cursive;
  font-size: 5rem;
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
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 150px;
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
  background-color: #007bff;
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

p {
  text-align: center;
  font-weight: bold;
  color: #555;
}
</style>

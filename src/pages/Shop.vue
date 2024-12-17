<template>
  <div class="shop-container">
    <h1>Product List</h1>


    <div class="product-grid">
      <div v-for="product in products" :key="product.id" class="product-card">
        <img :src="product.image" alt="Product Image" class="product-image" />
        <div class="product-details">
          <h2>{{ product.title }}</h2>
          <p>Quantity: {{ product.quantity }}</p>
          <p>Created At: {{ new Date(product.created_at).toLocaleString() }}</p>
          <button @click="addToCart(product.id)">Add to Cart</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabase';

export default {
  name: 'ReloadableShop',
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
      const { data, error } = await supabase
        .from('products')
        .select('*');
      if (error) {
        console.error('Error fetching products:', error);
      } else {
        this.products = data;
      }
    },
    startAutoReload() {
      this.reloadInterval = setInterval(this.fetchProducts, 1000); // Reload every 1 second
    },
    async addToCart(productId) {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User not logged in');
        return;
      }

      // Fetch current product quantity
      const { data: productData, error: fetchError } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', productId)
        .single();
      if (fetchError) {
        console.error('Error fetching product quantity:', fetchError);
        return;
      }

      const newQuantity = this.calculateNewQuantity(productData.quantity);

      // Update the product quantity
      const { error: updateError } = await supabase
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', productId);
      if (updateError) {
        console.error('Error updating product quantity:', updateError);
        return;
      }

      // Add to inventory
      const { error: insertError } = await supabase
        .from('inventories')
        .insert([{ user_id: userId, product_id: productId }]);
      if (insertError) {
        console.error('Error adding to cart:', insertError);
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
.shop-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
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

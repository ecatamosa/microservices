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
          <v-button @click="addToCart(product.id)">Add to Cart</v-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabase';

export default {
  name: 'Shop',
  data() {
    return {
      products: [],
    };
  },
  async created() {
    await this.fetchProducts();
    this.listenToInventoryChanges();
  },
  beforeDestroy() {
    this.stopInventorySubscription();
  },
  methods: {
    async fetchProducts() {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error('Error fetching products:', error);
      } else {
        this.products = data;
      }
    },
    listenToInventoryChanges() {
      this.inventorySubscription = supabase
        .channel('custom-inventory-channel') // Unique channel name
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'inventories' },
          async (payload) => {
            console.log('Inventory change detected:', payload);
            alert('Inventory has been updated!');
            await this.fetchProducts(); // Refresh product list on change
          }
        )
        .subscribe();

      console.log('Listening for inventory changes...');
    },
    stopInventorySubscription() {
      if (this.inventorySubscription) {
        supabase.removeChannel(this.inventorySubscription);
        console.log('Stopped listening for inventory changes.');
      }
    },
    async addToCart(productId) {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User not logged in');
        return;
      }

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
      const { error: updateError } = await supabase
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', productId);
      if (updateError) {
        console.error('Error updating product quantity:', updateError);
        return;
      } else {
        alert('A product has been checked out');
      }

      const { error: insertError } = await supabase
        .from('inventories')
        .insert([{ user_id: userId, product_id: productId }]);
      if (insertError) {
        console.error('Error adding to cart:', insertError);
      } else {
        this.decreaseProductQuantity(productId);
      }
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
</style>

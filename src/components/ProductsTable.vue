<template>
  <div>
    <v-card flat>
      <!-- Title and Search -->
      <v-card-title class="d-flex align-center pe-2">
        <v-icon icon="mdi-video-input-component"></v-icon>&nbsp; Find a Product

        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          density="compact"
          label="Search"
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          hide-details
          single-line
        ></v-text-field>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Data Table -->
      <v-data-table
        v-model:search="search"
        :filter-keys="['title']"
        :items="products"
        :headers="headers"
      >
        <!-- Product Title -->
        <template v-slot:item.title="{ item }">
          <div>{{ item.title }}</div>
        </template>

        <!-- Product Image -->
        <template v-slot:item.image="{ item }">
          <v-card class="my-2" elevation="2" rounded>
            <v-img :src="item.image" height="64" cover></v-img>
          </v-card>
        </template>

        <!-- Product Price -->
        <template v-slot:item.price="{ item }">
          <div>${{ item.price.toFixed(2) }}</div>
        </template>

        <!-- Stock Quantity -->
        <template v-slot:item.quantity="{ item }">
          <div>
            <v-chip
              :color="item.quantity > 0 ? 'green' : 'red'"
              class="text-uppercase"
              size="small"
              label
            >
              {{ item.quantity }}
            </v-chip>
          </div>
        </template>

        <!-- Edit & Delete -->
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { supabase } from "@/lib/supabase";

const search = ref(""); // For search input
const products = ref([]); // Holds products fetched from the database
let inventorySubscription = null;

// Table Headers
const headers = ref([
  { title: "Product Title", key: "title" },
  { title: "Image", key: "image", sortable: false },
  { title: "Price", key: "price" },
  { title: "Stock", key: "quantity" },
]);

// Fetch products from Supabase
const fetchProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("title, image, price, quantity");
  if (error) {
    console.error("Error fetching products:", error);
  } else {
    products.value = data.map((item) => ({
      title: item.title,
      image: item.image,
      price: item.price || 0.0,
      quantity: item.quantity || 0,
    }));
  }
};

// Listen to inventory changes
const listenToInventoryChanges = () => {
  inventorySubscription = supabase
    .channel("custom-inventory-channel")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "inventories" },
      async (payload) => {
        console.log("Inventory change detected:", payload);
        await fetchProducts();
      }
    )
    .subscribe();
  console.log("Listening for inventory changes...");
};

// Clean up inventory subscription
const stopInventorySubscription = () => {
  if (inventorySubscription) {
    supabase.removeChannel(inventorySubscription);
    console.log("Stopped listening for inventory changes.");
  }
};

// Lifecycle hooks
onMounted(() => {
  fetchProducts();
  listenToInventoryChanges();
});

onBeforeUnmount(() => {
  stopInventorySubscription();
});
</script>

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
        :filter-keys="['name']"
        :items="products"
        :headers="headers"
      >
        <template v-slot:header.stock>
          <div class="text-end">Stock</div>
        </template>

        <!-- Product Image -->
        <template v-slot:item.image="{ item }">
          <v-card class="my-2" elevation="2" rounded>
            <v-img
              :src="`https://cdn.vuetifyjs.com/docs/images/graphics/gpus/${item.image}`"
              height="64"
              cover
            ></v-img>
          </v-card>
        </template>

        <!-- Rating -->
        <template v-slot:item.rating="{ item }">
          <v-rating
            :model-value="item.rating"
            color="orange-darken-2"
            density="compact"
            size="small"
            readonly
          ></v-rating>
        </template>

        <!-- Stock Status -->
        <template v-slot:item.stock="{ }">
          <div class="text-end">
            <v-chip
              :color="item.stock ? 'green' : 'red'"
              :text="item.stock ? 'In stock' : 'Out of stock'"
              class="text-uppercase"
              size="small"
              label
            ></v-chip>
          </div>
        </template>
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
  { title: "Product Name", key: "name" },
  { title: "Image", key: "image", sortable: false },
  { title: "Price", key: "price" },
  { title: "Rating", key: "rating" },
  { title: "Stock", key: "stock" },
]);

// Fetch products from Supabase
const fetchProducts = async () => {
  const { data, error } = await supabase.from("products").select("*");
  if (error) {
    console.error("Error fetching products:", error);
  } else {
    products.value = data;
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

<style scoped></style>

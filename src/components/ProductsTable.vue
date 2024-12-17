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
          <v-chip
            :color="item.quantity > 0 ? 'green' : 'red'"
            class="text-uppercase"
            size="small"
            label
          >
            {{ item.quantity }}
          </v-chip>
        </template>

        <!-- Edit & Delete Actions -->
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            size="small"
            color="primary"
            @click="editProduct(item)"
            title="Edit Product"
          >
            <v-icon icon="mdi-pencil"></v-icon>
          </v-btn>
          <v-btn
            icon
            size="small"
            color="red"
            @click="deleteProduct(item)"
            title="Delete Product"
          >
            <v-icon icon="mdi-trash-can"></v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>Edit Product</v-card-title>
        <v-card-text>
          <v-row dense>
            <!-- Product Title -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="selectedProduct.title"
                label="Product Title*"
                required
              ></v-text-field>
            </v-col>

            <!-- Product Image -->
            <v-col cols="12" md="6">
              <v-file-input
                v-model="selectedProduct.image"
                accept="image/*"
                label="Product Image*"
                prepend-icon="mdi-camera"
              ></v-file-input>
            </v-col>

            <!-- Product Price -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="selectedProduct.price"
                label="Product Price*"
                type="number"
                required
              ></v-text-field>
            </v-col>

            <!-- Product Quantity -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="selectedProduct.quantity"
                label="Product Quantity*"
                type="number"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <small class="text-caption text-medium-emphasis"
            >*indicates required field</small
          >
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="plain" @click="dialog = false">Cancel</v-btn>
          <v-btn variant="tonal" color="primary" @click="saveProduct"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { supabase } from "@/lib/supabase";

const search = ref("");
const products = ref([]);
const dialog = ref(false);
const selectedProduct = ref({}); // Holds the product being edited
let inventorySubscription = null;

// Table Headers
const headers = ref([
  { title: "Product Title", key: "title" },
  { title: "Image", key: "image", sortable: false },
  { title: "Price", key: "price" },
  { title: "Stock", key: "quantity" },
  { title: "Actions", key: "actions", sortable: false },
]);

// Fetch products from Supabase
const fetchProducts = async () => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, title, image, price, quantity");
    if (error) throw error;

    products.value = data.map((item) => ({
      id: item.id,
      title: item.title,
      image: item.image,
      price: item.price || 0.0,
      quantity: item.quantity || 0,
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

// Edit Product Handler
const editProduct = (item) => {
  selectedProduct.value = { ...item };
  dialog.value = true;
};

// Save Product Changes
const saveProduct = async () => {
  try {
    let imageUrl = selectedProduct.value.image; // Keep the existing image URL if no new file is uploaded

    // Check if a new image file is provided
    if (selectedProduct.value.image instanceof File) {
      const file = selectedProduct.value.image;

      // Generate a unique file name for the image
      const fileName = `public/${Date.now()}_${file.name}`;

      // Upload the image to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Image upload error:", uploadError);
        throw uploadError;
      }

      // Fetch the public URL for the uploaded image
      const { data: publicUrlData, error: publicUrlError } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      if (publicUrlError || !publicUrlData) {
        console.error("Error fetching public URL:", publicUrlError);
        throw publicUrlError;
      }

      // Update image URL with the newly uploaded image
      imageUrl = publicUrlData.publicUrl;
    }

    // Prepare data for update
    const { id, ...updatedData } = selectedProduct.value;
    updatedData.image = imageUrl;

    // Update the product in Supabase
    const { error } = await supabase
      .from("products")
      .update(updatedData)
      .eq("id", id);

    if (error) {
      console.error("Error updating product:", error);
      throw error;
    }

    console.log("Product updated successfully");
    await fetchProducts(); // Refresh product list
  } catch (error) {
    console.error("Error saving product:", error);
  } finally {
    dialog.value = false;
  }
};

// Delete Product Handler
const deleteProduct = async (item) => {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", item.id);
    if (error) throw error;

    console.log("Product deleted successfully");
    fetchProducts(); // Refresh product list
  } catch (error) {
    console.error("Error deleting product:", error);
  }
};

// Subscribe to inventory changes
const listenToInventoryChanges = () => {
  inventorySubscription = supabase
    .channel("custom-inventory-channel")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "products" },
      async () => {
        await fetchProducts();
      }
    )
    .subscribe();
};

// Stop Subscription
const stopInventorySubscription = () => {
  if (inventorySubscription) {
    supabase.removeChannel(inventorySubscription);
  }
};

// Lifecycle Hooks
onMounted(() => {
  fetchProducts();
  listenToInventoryChanges();
});

onBeforeUnmount(() => {
  stopInventorySubscription();
});
</script>

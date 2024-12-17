<template>
  <div class="dashboard-container">
    <!-- Navigation Drawer -->
    <div class="navigation-drawer">
      <NavigationDrawer />
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="pa-4 text-center">
        <!-- Dialog for Adding/Editing Product -->
        <v-dialog v-model="dialog" max-width="600">
          <template v-slot:activator="{ props: activatorProps }">
            <v-btn
              class="text-none font-weight-regular"
              prepend-icon="mdi-plus"
              variant="tonal"
              color="primary"
              v-bind="activatorProps"
            >
              Add Product
            </v-btn>
          </template>

          <v-card>
            <v-card-title>Product Details</v-card-title>
            <v-card-text>
              <v-row dense>
                <!-- Product Title -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="product.title"
                    label="Product Title*"
                    required
                  ></v-text-field>
                </v-col>

                <!-- Product Image -->
                <v-col cols="12" md="6">
                  <v-file-input
                    v-model="productImage"
                    :rules="rules"
                    accept="image/png, image/jpeg, image/bmp"
                    label="Product Image*"
                    placeholder="Upload Image"
                    prepend-icon="mdi-camera"
                    required
                  ></v-file-input>
                </v-col>

                <!-- Product Price -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="product.price"
                    label="Product Price*"
                    type="number"
                    required
                  ></v-text-field>
                </v-col>

                <!-- Product Quantity -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="product.quantity"
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
              <v-btn variant="plain" @click="dialog = false">Close</v-btn>
              <v-btn variant="tonal" color="primary" @click="saveProduct">
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>

      <!-- Products Table -->
      <ProductsTable :products="products" :headers="headers" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { supabase } from "@/lib/supabase";
import ProductsTable from "@/components/ProductsTable.vue";
import NavigationDrawer from "@/components/NavigationDrawer.vue";

// Search and product states
const search = ref("");
const products = ref([]);
let inventorySubscription = null;

// Table headers
const headers = ref([
  { title: "Product Title", key: "title" },
  { title: "Image", key: "image", sortable: false },
  { title: "Price", key: "price" },
  { title: "Stock", key: "quantity" },
]);

// Dialog and product form
const dialog = ref(false);
const product = ref({
  title: "",
  image: "",
  price: 0,
  quantity: 0,
});
const productImage = ref(null); // Holds the selected image file

// Save product handler
const saveProduct = async () => {
  try {
    let imageUrl = "";

    // Upload the image to Supabase storage
    if (productImage.value) {
      const fileName = `public/${Date.now()}-${productImage.value.name}`;
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, productImage.value);

      if (uploadError) throw uploadError;

      // Generate public URL for the uploaded image
      imageUrl = `${
        supabase.storage.from("products").getPublicUrl(fileName).data.publicUrl
      }`;
    }

    // Add the product details to the database
    const { error } = await supabase.from("products").insert([
      {
        title: product.value.title,
        image: imageUrl, // Save the public URL in the database
        price: product.value.price,
        quantity: product.value.quantity,
      },
    ]);
    if (error) throw error;

    console.log("Product saved successfully:", product.value);
    fetchProducts();
  } catch (error) {
    console.error("Error saving product:", error);
  } finally {
    dialog.value = false;
  }
};

// Fetch products from database
const fetchProducts = async () => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("title, image, price, quantity");
    if (error) throw error;

    products.value = data.map((item) => ({
      title: item.title,
      image: item.image,
      price: item.price || 0.0,
      quantity: item.quantity || 0,
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
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

  console.log("Listening for inventory changes...");
};

// Unsubscribe on cleanup
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

<style scoped>
.dashboard-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.navigation-drawer {
  width: 240px;
  flex-shrink: 0;
  background-color: #f5f5f5;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.main-content {
  flex-grow: 1;
  overflow: auto;
  padding: 16px;
  background-color: #ffffff;
}
</style>

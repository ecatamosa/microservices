<template>
  <v-card>
    <v-layout>
      <v-navigation-drawer expand-on-hover rail>
        <v-list>
          <v-list-item
            prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg"
            subtitle="sandra_a88@gmailcom"
            title="Admin"
          ></v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item
            prepend-icon="mdi-folder"
            title="Products"
            value="products"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-account-multiple"
            title="Settings"
            value="settings"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-door"
            title="Log out"
            value="logout"
          ></v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main style="height: 600px"></v-main>
    </v-layout>
  </v-card>
</template>

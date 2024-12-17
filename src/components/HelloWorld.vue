<template>
  <v-container fluid id="cont"class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="6" md="4">
        <v-card class="pa-6" elevation="10">
          <!-- Card Title -->
          <v-card-title class="text-h5 text-center">
            User Options
          </v-card-title>

          <!-- Card Content -->
          <v-card-text class="text-center">
            Please select a user type to log in:
          </v-card-text>

          <!-- Card Actions -->
          <v-card-actions class="justify-center">
            <v-btn
              color="primary"
              class="ma-2"
              @click="loginAsCustomer"
            >
              Login as Customer
            </v-btn>

            <v-btn
              color="secondary"
              class="ma-2"
              @click="loginAsAdmin"
            >
              Login as Admin
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { supabase } from '@/lib/supabase';
import { useRouter } from 'vue-router';

export default {
  name: 'UserLogin',
  setup() {
    const router = useRouter();

    const loginAsCustomer = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', 1);
      if (error) {
        console.error('Error fetching user:', error);
      } else {
        console.log(data[0].id);
        localStorage.setItem('userId', data[0].id);
        router.push('/shop'); // Navigate to shop route
      }
    };

    const loginAsAdmin = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', 2);
      if (error) {
        console.error('Error fetching user:', error);
      } else {
        console.log(data[0].id);
        localStorage.setItem('userId', data[0].id);
        router.push('/dashboard'); // Navigate to dashboard route
      }
    };

    return {
      loginAsCustomer,
      loginAsAdmin,
    };
  },
};
</script>

<style>

 /* From Uiverse.io by kandalgaonkarshubham */
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

.v-card {
  border-radius: 12px;
}
</style>

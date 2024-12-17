<template>
<v-container>
  <v-row>
    <v-col>Hellow WOrld</v-col>
    <v-col>
      <button @click="loginAsCustomer">Login as Customer</button>
    </v-col>
    <v-col>
      <button @click="loginAsAdmin">Login as Admin</button>
    </v-col>
  </v-row>
</v-container>
</template>
<script>
import { supabase } from '@/lib/supabase';
import { useRouter } from 'vue-router';

export default {
  name: 'HelloWorld',
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
        router.push('/shop'); // Adjust the route as needed
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
        localStorage.setItem('userId', data[0].id);
        console.log(data[0].id);
        router.push('/dashboard'); // Adjust the route as needed
      }
    };

    return {
      loginAsCustomer,
      loginAsAdmin
    };
  }
};
</script>

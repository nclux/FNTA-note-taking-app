import React, { useState } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  Alert,
  signInStylesheet
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, router } from 'expo-router';
import { getCurrentUser, signIn } from '../../lib/appwrite';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { useGlobalContext } from '../../context/GlobalProvider';
import logo from '../../assets/logo.png';
import signInStyles from '../component_styles/SignInStyles';

/**
 * Sign in page Page.
 * 
 * This page allows the user to sign in using their authentication credentials.
 * Upon successful login, it will redirect to the home screen.
 * 
 * @component
 * @returns {JSX.Element} The rendered SignIn component.
 */

const SignIn = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [form, setForm] = useState({ email: '', password: '' });
  const [isSubmitting, setSubmitting] = useState(false);

  /**
   * Validates an email address.
   * 
   * @function isValidEmail
   * @param {string} email - The email address that are going to be evaluated
   * @returns {boolean} - return true if the the eail props is valid, or else false.
   */
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Handles form submission for log in.
   * 
   * Validates the form and attempt to log the user in the system,
   * if the sign in is successful, the router will redirect the user to the home component.
   * 
   * @function submit
   * @throws {Error} If sign-in fails, throw errors.
   */
  const submit = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Fill in all the fields');
      return;
    }

    if (!isValidEmail(form.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    console.log("Submitting with email:", form.email);

    setSubmitting(true);
    
    try {
      const session = await signIn(form.email, form.password);
      const result = await getCurrentUser();

      setUser(result);
      setIsLogged(true);

      router.replace('/home');
    } catch (error) {
      console.error("Error details:", error);
      Alert.alert('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={signInStyles.container}>

      <StatusBar style="light" />
      <View style={signInStyles.formContainer}>
        <View style={signInStyles.logoContainer}>
          <Image 
            source={logo} 
            style={signInStyles.logo}
          />
        </View>
        
        <Text style={signInStyles.title}>To continue please sign in</Text>
        
        <FormField
          title='Email'
          value={form.email}
          handleChangeText={(e) => setForm({ ...form, email: e })}
          keyboardType='email-address'
        />
        
        <FormField
          title='Password'
          value={form.password}
          handleChangeText={(e) => setForm({ ...form, password: e })}
        />
        
        <CustomButton
          title='Sign In'
          handlePress={submit}
          containersignInStyles={signInStyles.buttonContainer}
          isLoading={isSubmitting}
        />
        
        <View>
          <Text style={signInStyles.signUpText}>Do not have an account?</Text>
          <TouchableOpacity style={signInStyles.signUpLinkContainer}>
            <Link href='/sign-up' style={signInStyles.signUpLink}>Sign Up</Link>
          </TouchableOpacity>  
        </View>    
      </View>
    </SafeAreaView>
  );
};

export default SignIn;

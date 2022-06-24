/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState} from 'react';
import {Alert, Button, StyleSheet, Text, View, TextInput} from 'react-native';
import Auth0 from 'react-native-auth0';

var credentials = require('./auth0-configuration');
const auth0 = new Auth0(credentials);

const App = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    console.log({email, password});
  }, [password, email]);

  const onLogin = async (connection = 'username-password') => {
    let login;

    if (connection === 'apple') {
      login = await auth0.webAuth.authorize({
        connection: 'apple',
      });
    } else if (connection === 'google') {
      login = await auth0.webAuth.authorize({
        connection: 'google-oauth2',
      });
    } else {
      if (!email.trim() || !password.trim()) {
        return console.error('Please provide email and password');
      }

      login = await auth0.auth.passwordRealm({
        username: email,
        password,
        realm: credentials.realm,
        scope: credentials.scope,
      });
    }

    login
      .then(credentials => {
        console.log({credentials});
        setAccessToken(credentials.accessToken);
      })
      .error(err => {
        console.error('Err: ', err);
      });
  };

  const onLogout = () => {
    const logoutUrl = auth0.auth.logoutUrl({
      clientId: credentials.clientId,
      federated: true,
    });

    console.log({logoutUrl});
  };

  let loggedIn = accessToken !== null;
  return (
    <View style={styles.container}>
      <Text style={styles.header}> Auth0Sample - Login </Text>
      <Text>You are{loggedIn ? ' ' : ' not '}logged in. </Text>

      <View style={styles.block}>
        <TextInput
          placeholder="Email"
          onChangeText={text => {
            setEmail(text);
          }}
        />
      </View>

      <View style={styles.block}>
        <TextInput
          secureTextEntry
          placeholder="Password"
          onChangeText={text => {
            setPassword(text);
          }}
        />
      </View>

      <Button
        onPress={loggedIn ? onLogout : onLogin}
        title={loggedIn ? 'Log Out' : 'Log In'}
      />

      {loggedIn ? null : (
        <View style={{flexDirection: 'row'}}>
          <Button title="Google" onPress={() => onLogin('google')} />
          <Button title="Apple" onPress={() => onLogin('apple')} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  block: {
    padding: 5,
    border: '1px solid black',
  },
});

export default App;

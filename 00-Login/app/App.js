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

var config = require('./auth0-configuration');
const auth0 = new Auth0(config);

const connections = {
  username_password: 'username_password',
  google: 'google-oauth2',
  apple: 'apple',
};

// TODO: [refactor] Move to utils
const isSocialProvider = connection =>
  [connections.google, connections.apple].includes(connection);

const App = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [connection, setConnection] = useState(connections.username_password);

  useEffect(() => {
    console.log({email, password});
  }, [password, email]);

  const onLogin = async () => {
    try {
      let credentials;

      console.log({isSocialProvider: isSocialProvider(connection), connection});

      if (isSocialProvider(connection)) {
        credentials = await auth0.webAuth.authorize({
          connection,
        });
      } else {
        if (!email.trim() || !password.trim()) {
          return console.error('Please provide email and password');
        }

        credentials = await auth0.auth.passwordRealm({
          username: email,
          password,
          realm: config.realm,
          scope: config.scope,
        });
      }

      console.log({credentials});
      setAccessToken(credentials.accessToken);
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  const onLogout = async () => {
    if (isSocialProvider(connection)) {
      auth0.webAuth
        .clearSession()
        .then(success => {
          Alert.alert('Logged out!');
          setAccessToken(null);
        })
        .catch(error => {
          console.log('Log out cancelled', error);
        });
    } else {
      const logoutUrl = auth0.auth.logoutUrl({
        clientId: config.clientId,
        federated: true,
      });

      console.log({logoutUrl});
      await fetch(logoutUrl);
    }
  };

  let loggedIn = accessToken !== null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}> Auth0Sample - Login </Text>
      <Text>You are{loggedIn ? ' ' : ' not '}logged in. </Text>

      {loggedIn ? null : (
        <>
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
        </>
      )}

      <Button
        onPress={
          loggedIn
            ? onLogout
            : () => {
                setConnection(connections.username_password);
                onLogin();
              }
        }
        title={loggedIn ? 'Log Out' : 'Log In'}
      />

      {loggedIn ? null : (
        <View style={{flexDirection: 'row'}}>
          <Button
            title="Google"
            onPress={() => {
              setConnection(connections.google);
              onLogin();
            }}
          />
          <Button
            title="Apple"
            onPress={() => {
              setConnection(connections.apple);
              onLogin();
            }}
          />
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

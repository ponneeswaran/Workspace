import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, useWindowDimensions } from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useNavigation, useTheme } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { User } from 'phosphor-react-native';

import { GOOGLE_API_KEY } from '@env';

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! How can I help you with your finances?', isUser: false },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-latest' });
      const result = await model.generateContent(input);
      const response = result.response.text();

      const aiMessage: Message = { id: (Date.now() + 1).toString(), text: response, isUser: false };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), text: 'Sorry, I couldn\'t process that.', isUser: false };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.message, item.isUser ? styles.userMessage : styles.aiMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;
  const inputContainerBottom = isPortrait ? 55 : 0;

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();

  const onProfilePress = () => {
    navigation.navigate('Profile');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>AI Assistant</Text>
        <TouchableOpacity onPress={onProfilePress} style={[styles.profileButton, { backgroundColor: colors.border }]}>
          <User size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
      />
      <View style={[styles.inputContainer, { bottom: inputContainerBottom }]}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask me anything..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderColor: '#0D9488',
    borderWidth: 1,
  },
  container: {
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  input: {
    borderColor: '#0D9488',
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    bottom: 55,
    flexDirection: 'row',
    padding: 10,
  },
  message: {
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
    padding: 10,
  },
  messageText: {
    color: '#000000',
  },
  messagesList: {
    flex: 1,
    padding: 10,
  },
  profileButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  sendButton: {
    backgroundColor: '#0F766E',
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0F766E',
  },
});

export default ChatView;
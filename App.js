import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, ScrollView, ToastAndroid, Alert
, Modal, TextInput } from 'react-native';
import { CheckBox } from '@rneui/themed';
import React, { useState, useEffect } from 'react';
import { getDatabase, ref, child, get } from "firebase/database";
import { dbRef } from './firebaseConfig';
import { hashCode, showToast } from './helper';

export default function App() {
  const [answerCheck, setAnswerCheck] = useState(0);
  const [questionText, setQuestionText] = useState("Loading question...");
  const [readNextQuestion, setReadNextQuestion] = useState(true);
  const [option1, setOption1] = useState("Loading option...");
  const [option2, setOption2] = useState("Loading option...");
  const [option3, setOption3] = useState("Loading option...");
  const [option4, setOption4] = useState("Loading option...");
  const [currentAnswer, setCurrentAnswer] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [startGameAction, setStartGameAction] = useState("None");
  // var readingTime = 15;

  const readQuestion = async() =>{
    //Reset the option
    setAnswerCheck(0);

    //Read question
    var randomQuestion = Math.floor(Math.random() * 151) + 1;
    setReadNextQuestion(false);
    setQuestionCount(questionCount + 1);
    await get(child(dbRef, `Questions/${"Question-" + randomQuestion}`)).then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val())
        setQuestionText(snapshot.val().question);
        setOption1(snapshot.val().option_1);
        setOption2(snapshot.val().option_2);
        setOption3(snapshot.val().option_3);
        setOption4(snapshot.val().option_4);
        setCurrentAnswer(snapshot.val().answer);
        setReadingTime(15);
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  const amswerQuestion = (answer) => {
    setAnswerCheck(answer);
    console.log("Answer given: " + answer)
    if(answer === currentAnswer){
      showToast("You get it correct!");
    }
    else{
      showToast("Your answer is wrong!");
    }
  };

  const startGame = async () => {

    if(startGameAction === "Create User"){
      if(username.length === 0 || password.length === 0){
        Alert.alert('Invalid Input', 'You cannot leave empty field(s)!', [
          {
            text: 'Confirm',
          },
        ]);
      }
      else{
        //Check user exists
        await get(child(dbRef, `users/${username}`)).then((snapshot) => {
          if (snapshot.exists()) {
            Alert.alert('Invalid Username', 'This username already exists, please choose another one', [
              {
                text: 'Confirm',
              },
            ]);
          } 
          else {
            console.log("New user");
          }
        }).catch((error) => {
          console.error(error);
        });
      }
      
    }
    else if(startGameAction === "Login"){
      if(username.length === 0 || password.length === 0){
        Alert.alert('Invalid Input', 'You cannot leave empty field(s)!', [
          {
            text: 'Confirm',
          },
        ]);
      }
    }
    
  };

  function displayReadingTimer(){
    setReadingTime(readingTime - 1);
  }

  useEffect(() => {

    console.log("Start Game Action: " + startGameAction)
    if(readingTime !== 0){
      const interval = setInterval(() => displayReadingTimer(), 1000);
      return () => clearInterval(interval);
    }

  });

  return (
    <ScrollView style={styles.container}>
      <Modal>
        <View style={styles.gameRulesView}>
          <Text style={[styles.gameRulesText, styles.gameRulesTitle]}>Game Rules:</Text>

          <Text style={styles.gameRulesText}>
            1) There will be a total of 20 questions to answer, questions will be selected randomly from the database.
          </Text>

          <Text style={styles.gameRulesText}>
            2) The scores that you get for every correct answer will be dependent on the time that you use, the quicker you answer, the more scores you will get from it.
          </Text>

          <Text style={styles.gameRulesText}>
            3) The more you answer correctly continuously, the more points you can get for the next correct answer. Every extra continuous correct answer will add extra one mark for the next correct answer.
          </Text>

          <Text style={styles.gameRulesText}>
            4) Any answer that is given later than 5 seconds, no scores will be given, but it will be counted as a continuous correct answer.
          </Text>

          <View>

          {
            startGameAction === "None" && 
            <View>
              <View>
                <Button
                  title="New User"
                  onPress={() => setStartGameAction("Create User")}
                />
              </View>

              <View style={styles.loginBtn}>
                <Button
                  title="Login"
                  onPress={() => setStartGameAction("Login")}
                />
              </View>
            </View>
          }

            {
              startGameAction === "Create User" && 
              <View>

                <TextInput
                  style={styles.input}
                  onChangeText={text => setUsername(text)}
                  placeholder="Type your name"
                  keyboardType="default"
                />

                <View>
                  <TextInput
                    style={styles.input}
                    onChangeText={text => setPassword(text)}
                    placeholder="Please enter password to register yourself"
                    keyboardType="visible-password"
                  />
                </View>

                <View>
                  <Button
                    title="Create User"
                    onPress={startGame}
                  />
                </View>

                <View style={styles.backBtn}>
                  <Button
                    title="Back"
                    color="#bab9b5"
                    onPress={() => {setStartGameAction("None"); setUsername(""); setPassword("")}}
                  />
                </View>

              </View>

            }

            {
              startGameAction === "Login" && 
              <View>

                <TextInput
                  style={styles.input}
                  onChangeText={text => setUsername(text)}
                  placeholder="Type your name"
                  keyboardType="default"
                />

                <View>
                  <TextInput
                    style={styles.input}
                    onChangeText={text => setPassword(text)}
                    placeholder="Password"
                    keyboardType="visible-password"
                  />
                </View>
                

                <View>
                  <Button
                    title="Login"
                    onPress={startGame}
                  />
                </View>

                <View style={styles.backBtn}>
                  <Button
                    title="Back"
                    color="#bab9b5"
                    onPress={() => {setStartGameAction("None"); setUsername(""); setPassword("")}}
                  />
                </View>

              </View>

            }
            
          </View>
        </View>
      </Modal>

      <View style={styles.scoreboard}>
        <Text style={styles.boardText}>Total Scores:</Text>
        <Text style={styles.boardText}>Continuous Correct Answer:</Text>
        <Text style={styles.boardText}>Total Correct Answer:</Text>
      </View>

      <Text style={styles.readingTime}>Reading Time left: {readingTime}</Text>
      <Text style={styles.questionText}>{questionCount + ". " + questionText}</Text>

      <CheckBox
          style={styles.checkbox}
          disabled={answerCheck !== 0 || option1 === "Loading option..."}
          title={option1}
          checked={answerCheck === option1}
          onPress={() => amswerQuestion(option1)}
        />

        <CheckBox
          style={styles.checkbox}
          disabled={answerCheck !== 0 || option2 === "Loading option..."}
          title={option2}
          checked={answerCheck === option2}
          onPress={() => amswerQuestion(option2)}
        />

        <CheckBox
          style={styles.checkbox}
          disabled={answerCheck !== 0 || option3 === "Loading option..."}
          title={option3}
          checked={answerCheck === option3}
          onPress={() => amswerQuestion(option3)}
        />

        <CheckBox
          style={styles.checkbox}
          disabled={answerCheck !== 0 || option4 === "Loading option..."}
          title={option4}
          checked={answerCheck === option4}
          onPress={() => amswerQuestion(option4)}
        />

      <Button
        title="Reading Question"
        onPress={() => readQuestion()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  questionText:{
    marginBottom:20,
    paddingTop:25,
    fontSize: 20,
  },
  checkbox:{

  },
  scoreboard:{
    backgroundColor: "black",
    width: "100%",
    padding: 10,
    marginTop: 20,
  },
  boardText:{
    color: "white"
  },
  readingTime:{
    marginTop: 10,
    fontSize: 18
  },
  gameRulesView:{
    padding: 20,
  },
  gameRulesText:{
    fontSize:15,
    marginBottom:10
  },
  gameRulesTitle:{
    fontWeight: 'bold'
  },
  input: {
    height: 40,
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  loginBtn: {
    marginTop: 10,
  },
  backBtn: {
    marginTop: 10,
  }
});

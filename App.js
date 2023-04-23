import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, ScrollView, ToastAndroid } from 'react-native';
import { CheckBox } from '@rneui/themed';
import React, { useState, useEffect } from 'react';
import { getDatabase, ref, child, get } from "firebase/database";
import { dbRef } from './firebaseConfig';

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

  const showToast = (message) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  };

  useEffect(() => {
    if(readNextQuestion){
      readQuestion();
    }
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.scoreboard}>
        <Text style={styles.boardText}>Total Scores:</Text>
        <Text style={styles.boardText}>Continuous Correct Answer:</Text>
        <Text style={styles.boardText}>Total Correct Answer:</Text>
      </View>

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
  }
});

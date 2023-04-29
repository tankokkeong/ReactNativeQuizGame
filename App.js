import { StatusBar } from 'expo-status-bar';
import { styles } from './style/style';
import { Text, View, Button, ScrollView, Alert
, Modal, TextInput } from 'react-native';
import { CheckBox } from '@rneui/themed';
import React, { useState, useEffect } from 'react';
import { getDatabase, ref, child, get, set, update
, query, orderByChild, limitToLast, onValue } from "firebase/database";
import { dbRef } from './firebaseConfig';
import { hashCode, showToast } from './helper';

export default function App() {
  const [answerCheck, setAnswerCheck] = useState(-1);
  const [questionText, setQuestionText] = useState("Loading question...");
  const [option1, setOption1] = useState("Loading option...");
  const [option2, setOption2] = useState("Loading option...");
  const [option3, setOption3] = useState("Loading option...");
  const [option4, setOption4] = useState("Loading option...");
  const [currentAnswer, setCurrentAnswer] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [answerTime, setAnswerTime] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [startGameAction, setStartGameAction] = useState("None");
  const [modalVisibile, setModalVisible] = useState(true);
  const [totalScores, setTotalScores] = useState(0);
  const [conCorrectAns, setConCorrectAns] = useState(0);
  const [totalCorrectAns, setTotalCorrectAns] = useState(0);
  const [userHighestScore, setUserHighestScore] = useState(0);
  const [displayRankingBoard, setDisplayRankingBoard] = useState(true);
  const [scoreRanking, setScoreRanking] = useState([]);
  const db = getDatabase();
  var ranking = 0;

  const readQuestion = async() =>{

    if(displayRankingBoard){
      rankingBoard();
    }

    //Block the option
    setAnswerCheck(-1);

    //Read question
    var randomQuestion = Math.floor(Math.random() * 151) + 1;
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
        setReadingTime(10);
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  const answerQuestion = async (answer) => {
    setAnswerCheck(answer);
    console.log("Answer given: " + answer)
    if(answer === currentAnswer){
      //Score calculation
      var scoreOfTheRound;

      if(answerTime >= 10){
          scoreOfTheRound = 5 + (answerTime - 10) + conCorrectAns;
      }
      else{
          scoreOfTheRound = 0;
      }

      var newTotal = totalScores + scoreOfTheRound;

      const updates = {};
      updates[`users/${username}/continuousCorrect`] = conCorrectAns + 1;
      updates[`users/${username}/highestScore`] = newTotal > userHighestScore ? newTotal : userHighestScore;
      updates[`users/${username}/scores`] = newTotal;
      updates[`users/${username}/totalCorrect`] = totalCorrectAns + 1;

      await update(ref(db), updates);

      //Check the highest score
      if(newTotal > userHighestScore){
        setUserHighestScore(newTotal);
      }
      
      //Increase the total correct
      setTotalCorrectAns(totalCorrectAns + 1);
      setConCorrectAns(conCorrectAns + 1);
      setTotalScores(newTotal);

      showToast("You get it correct!");
    }
    else{
      const updates = {};
      setConCorrectAns(0);
      updates[`users/${username}/continuousCorrect`] =  0;
      await update(ref(db), updates);

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

            set(ref(db, 'users/' + username), {
              continuousCorrect: 0,
              highestScore: 0,
              scores: 0,
              totalCorrect: 0,
              username: username,
              password: hashCode(password)
            })
            .then(() => {
              Alert.alert('Successful', 'User created sucessful!', [
                {
                  text: 'Confirm',
                },
              ]);
            })
            .catch((error) => {
              // The write failed...
            });
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
      else{
        //Check user exists
        await get(child(dbRef, `users/${username}`)).then((snapshot) => {
          if (snapshot.exists()) {
            if(username === snapshot.val().username && hashCode(password) === snapshot.val().password){
              console.log("Login Successful!");
              readQuestion();
              setModalVisible(false);
              setUserHighestScore(snapshot.val().highestScore);
            }
            else{
              Alert.alert('Invalid Login', 'Incorrect username or password!', [
                {
                  text: 'Confirm',
                },
              ]);
            }
          } 
          else {
              Alert.alert('Invalid Login', 'Incorrect username or password!', [
                {
                  text: 'Confirm',
                },
              ]);
          }
              
        }).catch((error) => {
          console.error(error);
        });
      }
    }
    
  };

  function displayReadingTimer(){
    setReadingTime(readingTime - 1);

    if(readingTime - 1 === 0){
      setAnswerTime(15);
      setAnswerCheck(0);
    }
  }

  function displayAnswerTimer(){

    setAnswerTime(answerTime - 1);

    if(answerTime - 1 === 0){
      readQuestion();
    }
  }

  const rankingBoard = () => {
    const rankingRef = query(ref(db, 'users/'), orderByChild("highestScore"), limitToLast(10));
    
    onValue(rankingRef, (snapshot) => {
      const tempRankingArr = [];

      snapshot.forEach((snapChild) => {
        const data = snapChild.val();
        tempRankingArr.push(data);
        // console.log(data)
      });
      tempRankingArr.reverse();
      setScoreRanking(tempRankingArr);
    });

    setDisplayRankingBoard(false);
  };

  const quitGame = () => {
    setAnswerCheck(-1);
    setAnswerTime(0);
    setReadingTime(0);
    setModalVisible(true);
  };

  useEffect(() => {

    if(readingTime !== 0){
      const interval = setInterval(() => displayReadingTimer(), 1000);
      return () => clearInterval(interval);
    }
    else if(answerTime !== 0){
      const interval = setInterval(() => displayAnswerTimer(), 1000);
      return () => clearInterval(interval);
    }

  });

  return (
    <ScrollView>
      <View style={styles.container}>
        <Modal visible={modalVisibile}>
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
          <Text style={styles.boardText}>Total Scores: {totalScores}</Text>
          <Text style={styles.boardText}>Continuous Correct Answer: {conCorrectAns}</Text>
          <Text style={styles.boardText}>Total Correct Answer:{totalCorrectAns}</Text>
        </View>

        {
          readingTime !== 0 &&
          <Text style={styles.readingTime}>Reading Time left: {readingTime}</Text>
        }

        {
          answerTime !== 0 &&
          <Text style={styles.readingTime}>Answer Time left: {answerTime}</Text>
        }
        <Text style={styles.questionText}>{questionCount + ". " + questionText}</Text>

        <View>
        <CheckBox
            style={styles.checkbox}
            disabled={answerCheck !== 0 || option1 === "Loading option..."}
            title={option1}
            checked={answerCheck === option1}
            onPress={() => answerQuestion(option1)}
          />

          <CheckBox
            style={styles.checkbox}
            disabled={answerCheck !== 0 || option2 === "Loading option..."}
            title={option2}
            checked={answerCheck === option2}
            onPress={() => answerQuestion(option2)}
          />

          <CheckBox
            style={styles.checkbox}
            disabled={answerCheck !== 0 || option3 === "Loading option..."}
            title={option3}
            checked={answerCheck === option3}
            onPress={() => answerQuestion(option3)}
          />

          <CheckBox
            style={styles.checkbox}
            disabled={answerCheck !== 0 || option4 === "Loading option..."}
            title={option4}
            checked={answerCheck === option4}
            onPress={() => answerQuestion(option4)}
          />
        </View>

        <Button
          title="Quit Game"
          onPress={() => quitGame()}
        />

        <View style={styles.rankingBoard}>
          <Text style={styles.rankingBoardTitle}>Top 10 Ranking</Text>
          
          <View>
            <View style={styles.rankingListContainer}>
              <Text style={[styles.rankingBoardText, styles.rankingItem]} >
                User Name
              </Text>

              <Text style={[styles.rankingBoardText, styles.rankingItem]}>
                Scores
              </Text>
            </View>

            {        
              scoreRanking.map((score, index) => {
                ranking++;
                // const uniqueKey = crypto.randomUUID();
                return(
                  <View style={styles.rankingListContainer} key={index}>
                    <Text 
                      style={[styles.rankingBoardText, styles.rankingItem]}
                    >
                      {ranking + ". "} {score.username} 
                    </Text>

                    <Text 
                      style={[styles.rankingBoardText, styles.rankingItem]}
                    >
                      {score.highestScore}
                    </Text>
                  </View>
                )
              })
            }
          </View>
          
        </View>

      </View>
    </ScrollView>
  );
}
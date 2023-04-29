import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
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
    },
    rankingBoard:{
        backgroundColor: "black",
        padding: 10,
        marginTop: 15,
        marginBottom: 15,
    },
    rankingBoardText:{
        color: "white",
    },
    rankingBoardTitle:{
        color: "white",
        fontSize: 15,
        textAlign: "center"
    },
    rankingListContainer:{
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start', // if you want to fill rows left to right
        marginTop: 10,
    },
    rankingItem: {
        width: '50%' // is 50% of container width
    }
});
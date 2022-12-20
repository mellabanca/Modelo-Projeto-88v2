import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TabNavigator from "./TabNavigator";
import PostScreen from "../screens/PostScreen";

const Stack = createStackNavigator();

const StackNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Tela Inicial"
            screenOptions={{
                headerShown: false
            }}
        >
            <Stack.Screen name="Tela Inicial" component={TabNavigator} />
            <Stack.Screen name="Tela de Posts" component={PostScreen} />
        </Stack.Navigator>
    );
};

export default StackNavigator;

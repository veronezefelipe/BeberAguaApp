import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Text } from "react-native";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AguaContador from "../components/agua_contador";
import { setupNotifications, updateNotifications, carregar } from "../utils/notifications";
import { useTheme } from "../utils/ThemeContext";

const HISTORICO_AGUA = "waterHistory";
const SETTINGS_PATH = "beberagua:notificationSettings"; // Updated to match settings/index.jsx

export default function HomeScreen() {
    const { theme } = useTheme();
    const [copos, setCopos] = useState(0);
    const [dailyGoal, setDailyGoal] = useState(8);
    const [userName, setUserName] = useState(""); // Add this state

    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(SETTINGS_PATH);
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.dailyGoal) {
            setDailyGoal(parsed.dailyGoal);
          }
          if (parsed.userName) { // Add this
            setUserName(parsed.userName);
          }
        }
      } catch (e) {
        console.error("Erro ao carregar configurações:", e);
      }
    };

    useEffect(() => {
      const initialize = async () => {
        await loadSettings();
        await setupNotifications();
        await updateNotifications();
      };
      initialize();
    }, []);

    useFocusEffect(
      useCallback(() => {
        const recarregarAoVoltar = async () => {
          await loadSettings();
        };
        recarregarAoVoltar();
      }, [])
    );

    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.welcomeText, { color: theme.primaryDark }]}>
          {userName 
            ? `Olá, ${userName}! Vamos nos hidratar hoje?` 
            : "Vamos nos hidratar hoje?"}
        </Text>
        
        <Text style={[styles.title, { color: theme.primaryDark }]}>
          Lembrete de Água
        </Text>
        
        <AguaContador copos={copos} setCopos={setCopos} />
        <View style={[styles.progressContainer, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.progressText, { color: theme.secondaryText }]}>
            Progresso: {copos}/{dailyGoal} copos
          </Text>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  backgroundColor: theme.primary,
                  width: `${Math.min((copos / dailyGoal) * 100, 100)}%`
                }
              ]} 
            />
          </View>
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 15,
      justifyContent: "flex-start",
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      textAlign: "center",
      marginTop: 10,
      marginBottom: 20,
    },
    progressContainer: {
      padding: 15,
      borderRadius: 10,
      marginTop: 20,
    },
    progressText: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 10,
    },
    progressBarContainer: {
      height: 10,
      backgroundColor: '#E0E0E0',
      borderRadius: 5,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      borderRadius: 5,
    },
    welcomeText: {
      fontSize: 24,
      fontWeight: "500",
      textAlign: "center",
      marginVertical: 10,
      paddingHorizontal: 20,
    },
  });

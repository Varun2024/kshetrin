# Kshetrin (Frontend) 🌾📱

Kshetrin is the **frontend application** for an agri-tech solution built during **Smart India Hackathon (SIH) 2025**.  
It provides a responsive interface for farmers and stakeholders to interact with soil analysis, recommendations, and irrigation insights powered by the backend API.

---

## 🚀 Project Overview

Kshetrin frontend is a **React/Expo based application** designed to:

- Collect user inputs such as soil nutrient values and field details  
- Display **data-driven recommendations** from the backend  
- Support future mobile and web usage (Expo framework)  
- Provide a clean, intuitive, and responsive UI

The frontend connects with the **Kshetrin Backend** API to fetch recommendations and display insights in real time.

---

## 🎯 Features

- 📥 Input forms for soil data submission  
- 🔄 Integration with backend APIs for analysis  
- 📊 Display of recommendation results  
- 📱 Designed using React and Expo for cross-platform compatibility  
- 🧩 Modular, reusable components for scalable UI

---

## 🛠 Tech Stack

- **Framework:** React / Expo  
- **Languages:** TypeScript, JavaScript  
- **UI:** Tailwind CSS (with NativeWind)  
- **Navigation:** Expo Router  
- **State Management:** React Context / Hooks  
- **Build Tools:** Metro Bundler (default for React Native + Expo)  
- **Deployment:** Expo Go / EAS  

---

## 💡 Getting Started

Follow these steps to run the app locally:

### 1. Clone the repository

```bash
git clone https://github.com/Varun2024/kshetrin.git
cd kshetrin
```

### 🧠 App Structure
📁 app
├── assets/              # Images, icons, fonts
├── components/          # Reusable UI components
├── constants/           # App constants and config
├── context/             # React context providers (state management)
├── hooks/               # Custom hooks
├── screens/             # App screens & views
└── utils/               # Utility functions

### 🔗 API Integration
The frontend expects an API server (Kshetrin backend) running with the following endpoints:

| Endpoint              | Method | Functionality                      |
| --------------------- | ------ | ---------------------------------- |
| `/soil-data`          | POST   | Send soil nutrient data            |
| `/recommendations`    | GET    | Receive irrigation recommendations |
| `/irrigation-control` | POST   | Trigger irrigation instructions    |

### 📱 Why Expo?
Expo simplifies mobile app development by providing:
- Fast development previews with Expo Go
- Managed workflow without heavy native config
- OTA update
- Built-in support for permissions and device APIs
This makes Kshetrin easier to develop, test, and scale across devices.

### 🌱 Future Improvements

- Auth flow for farmer/user accounts
- Offline data storage
- Better result visualization (charts, graphs)
- Multi-language support
- Deployment via EAS for production builds

### 🙌 Acknowledgements

Huge thanks to
Our SIH 2025 teammates for collaboration
Our mentor for guidance and support
The Smart India Hackathon platform for the opportunity

### ⭐ Show Some Love

If you find this repository helpful, give it a star!
It keeps me motivated to build more meaningful solutions 🙌

---

If you want, I can also generate:
✅ A **combined frontend + backend README**  
✅ **API docs (Swagger/OpenAPI) section**  
✅ **Screenshots and UI previews** for the README  

Just let me know what style you prefer! 🚀 


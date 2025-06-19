const getTokenExpiration = (token) => {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      if (!decoded.exp) return null;
      const expirationTime = decoded.exp * 1000; // konvertera till ms
      return expirationTime;
    } catch (error) {
      console.error("Fel vid dekodning av token:", error);
      return null;
    }
  };
  
  export default getTokenExpiration;
  
import React, { useEffect, useState } from "react";
import ModalForm from "./components/ModalForm/ModalForm";
import empty from "../../../../assets/empty.jpg";
import "./Foods.css";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import { FreeMode, Navigation } from "swiper/modules";
import Filter from "../Filter/Filter";
import loader from "../../../../assets/loader.gif"

function Foods() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [isError, setIsError] = useState(false);
  const [foodsData, setFoodsData] = useState([]);
  const [counts, setCounts] = useState([]);
  const [isBasketPopupVisible, setBasketPopupVisible] = useState(false);
  const [localStorageData, setLocalStorageData] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [buttonTexts, setButtonTexts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/foods");
        const data = await response.json();
        setFoodsData(data);
        setCounts(Array(data.length).fill(0));
      } catch (error) {
        console.error("fetch error", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const storedData = localStorage.getItem("cart");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setLocalStorageData(parsedData);
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
      }
    }
  }, []);

  const saveDataToLocalStorage = (data) => {
    localStorage.setItem("cart", JSON.stringify(data));
  };

  const handleCloseButtonClick = () => {
    setBasketPopupVisible(false);
  };

  const handleSendButtonClick = () => {
    if (localStorageData.length > 0) {
      setModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleBasketClick = () => {
    setBasketPopupVisible(!isBasketPopupVisible);
  };

  const handleAddToCart = (food, index) => {
    const quantity = counts[index] + 1;

    const existingCart = [...localStorageData];
    const existingItemIndex = existingCart.findIndex(
      (item) => item.id === food.id
    );

    if (existingItemIndex !== -1) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push({ ...food, quantity });
    }
    setLocalStorageData(existingCart);
    saveDataToLocalStorage(existingCart);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 1500);
  };
  const handleIncrementBasket = (index) => {
    setLocalStorageData((prevData) => {
      const updatedData = prevData.map((item, i) => {
        if (i === index) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });

      saveDataToLocalStorage(updatedData);
      return updatedData;
    });
  };

  const handleDecrementBasket = (index) => {
    setLocalStorageData((prevData) => {
      const updatedData = prevData
        .map((item, i) => {
          if (i === index) {
            const newQuantity = item.quantity - 1;

            if (newQuantity > 0) {
              return { ...item, quantity: newQuantity };
            }
            return null;
          }
          return item;
        })
        .filter(Boolean);

      saveDataToLocalStorage(updatedData);
      return updatedData;
    });
  };

  const updateQuantity = (index, increment) => {
    setLocalStorageData((prevData) => {
      const updatedData = prevData
        .map((item, i) => {
          if (i === index) {
            const newQuantity = item.quantity + increment;

            if (newQuantity > 0) {
              return { ...item, quantity: newQuantity };
            }
            return null;
          }
          return item;
        })
        .filter(Boolean);

      saveDataToLocalStorage(updatedData);
      return updatedData;
    });
  };

  const calculateTotalSum = () => {
    return localStorageData.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const calculateTotalQuantity = () => {
    return (
      localStorageData.reduce((total, item) => total + item.quantity, 0) || 0
    );
  };

  const handleDeleteFromCart = (index) => {
    setLocalStorageData((prevData) => {
      const updatedData = prevData.filter((item, i) => i !== index);
      saveDataToLocalStorage(updatedData);
      return updatedData;
    });
  };
  function getFoodName(food) {
    const lang = localStorage.getItem("lang");

    switch (lang) {
      case "ru":
        return food.title_ru;
      case "uz":
        return food.title_uz;
      case "en":
        return food.title_en;
      default:
        return food.title_ru;
    }
  }
  function getFoodDescription(food) {
    const lang = localStorage.getItem("lang");

    switch (lang) {
      case "ru":
        return food.description_ru;
      case "uz":
        return food.description_uz;
      case "en":
        return food.description_en;
      default:
        return food.description_ru;
    }
  }
  return (
    <div className="parent-div">
      {showAlert && (
        <div className="alert alert-success show" role="alert">
          {t("modal")}
          <i className="ri-check-double-line"></i>
        </div>
      )}
      <div className="basket" onClick={handleBasketClick}>
        <i className="ri-shopping-basket-2-line"></i>
        {calculateTotalSum()} {t("sum")}
      </div>
      <div className="foods_all">
        <h1 className="filter_title vse"> {t("all")}</h1>
        {isLoading ? (
          <div className="loader">
          <img src={loader} alt="" />
          </div>
        ) : isError ? (
          <p>Error fetching data</p>
        ) : (
          <Swiper
            slidesPerView={5}
            spaceBetween={30}
            freeMode={true}
            navigation={true}
            modules={[FreeMode, Navigation]}
            className="mySwiper"
          >
            {foodsData.map((food, index) => (
              <SwiperSlide className="swiper1" key={index}>
                <div className="all-foods">
                  <img
                    className="food_image"
                    src={`http://127.0.0.1:8000/storage/${food.image}`}
                    alt={`Food: ${food.title}`}
                  />
                  <div className="foods_text">
                    <p className="food_title"> {getFoodName(food)}</p>
                    <p className="food_description">
                      {getFoodDescription(food)}
                    </p>
                    <p className="food_price">
                      {food.price} {t("sum")}
                    </p>

                    <div className="div_bottom">
                      <div>
                        <button
                          className="add_to_cart_button"
                          onClick={() => handleAddToCart(food, index)}
                        >
                          {t("add")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
        <div className={`basket-popup ${isBasketPopupVisible ? "active" : ""}`}>
          <div
            className="basket-popup-content"
            style={{
              padding: "20px",
              background: "#fff",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "30px",
                  fontWeight: "700",
                  color: "#777676",
                  marginBottom: "10px",
                }}
              >
                {t("ordertext")}
              </p>
              {localStorageData.length > 0 ? (
                <div>
                  <ul style={{ listStyleType: "none", padding: 0 }}>
                    {localStorageData.map((item, index) => (
                      <div
                        key={index}
                        className="card_all"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "10px",
                          borderBottom: "1px solid #ccc",
                          paddingBottom: "10px",
                        }}
                      >
                        <div className="card_items" style={{ flex: 1 }}>
                          <p
                            className="food_title"
                            style={{
                              fontSize: "16px",
                              fontWeight: "bold",
                              marginBottom: "5px",
                            }}
                          >
                            {item.title}
                          </p>
                          <p
                            className="food_price"
                            style={{ fontSize: "14px", color: "#777" }}
                          >
                            {item.price} {t("sum")}
                          </p>
                          <div
                            className="card_count"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginTop: "5px",
                            }}
                          >
                            <p
                              className="count_button"
                              onClick={() => handleDecrementBasket(index)}
                              style={{
                                cursor: "pointer",
                                fontSize: "18px",
                                marginRight: "5px",
                              }}
                            >
                              -
                            </p>
                            <p
                              className="count_value"
                              style={{ fontSize: "16px", fontWeight: "bold" }}
                            >
                              {item.quantity}
                            </p>
                            <p
                              className="count_button"
                              onClick={() => handleIncrementBasket(index)}
                              style={{
                                cursor: "pointer",
                                fontSize: "18px",
                                marginLeft: "5px",
                              }}
                            >
                              +
                            </p>
                            <button
                              className="delete_button"
                              onClick={() => handleDeleteFromCart(index)}
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </div>
                        <div>
                          <img
                            className="card_image"
                            src={`http://127.0.0.1:8000/storage/${item.image}`}
                            alt={`Food: ${item.title}`}
                            style={{
                              width: "80px",
                              height: "80px",
                              borderRadius: "8px",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </ul>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      marginTop: "10px",
                    }}
                  >
                    {t("allprice")}
                    {calculateTotalSum()}
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <img className="empty" src={empty} alt="" />
                  <p className="empty-card" style={{ fontSize: "24px" }}>
                    {t("empty")}
                  </p>
                </div>
              )}
            </div>
            <div className="card-buttons">
              <button
                onClick={handleCloseButtonClick}
                style={{
                  marginTop: "20px",
                  padding: "10px 20px",
                  fontSize: "16px",
                  marginRight: "10px",
                  cursor: "pointer",
                  borderRadius: "30px",
                  backgroundColor: "#ccc",
                  border: "none",
                  color: "black",
                  fontWeight: "600",
                }}
              >
                {t("close")}
              </button>
              <button
                onClick={(e) => {
                  handleSendButtonClick(e);
                  handleCloseButtonClick(e);
                }}
                style={{
                  marginTop: "20px",
                  padding: "10px 20px",
                  fontSize: "16px",
                  cursor: "pointer",
                  borderRadius: "30px",
                  background: "linear-gradient(to right, grey, black)",
                  border: "none",
                  color: "white",
                }}
              >
                {t("send")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ModalForm
          localStorageData={localStorageData}
          totalPrice={calculateTotalSum()}
          handleModalClose={handleModalClose}
          setModalOpen={setModalOpen}
          handleCloseButtonClick={handleCloseButtonClick}
        />
      )}
      <Filter handleAddToCart={handleAddToCart} />
    </div>
  );
}

export default Foods;

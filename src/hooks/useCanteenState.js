import { useEffect, useMemo, useRef, useState } from "react";
import {
  baseMenu,
  getInitialTheme,
  getMenuImage,
  initialOrders,
  orderStatusLabel,
} from "../lib/canteenData";

function useCanteenState() {
  const queueBoardRef = useRef(null);
  const queueReadyFlashTimeoutsRef = useRef({});

  const [theme, setTheme] = useState(getInitialTheme);
  const [isQueueFullscreen, setIsQueueFullscreen] = useState(false);
  const [menuItems, setMenuItems] = useState(
    baseMenu.map((item, index) => ({
      ...item,
      image: getMenuImage(item),
      available: index !== 13,
      archived: false,
    })),
  );
  const [orders, setOrders] = useState(initialOrders);
  const [cart, setCart] = useState({});
  const [paymentMode, setPaymentMode] = useState("online");
  const [nextToken, setNextToken] = useState(203);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeKind, setActiveKind] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [profileOpen, setProfileOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [cartSheetOpen, setCartSheetOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [networkHint, setNetworkHint] = useState(null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [paymentError, setPaymentError] = useState(null);
  const [queueReadyFlashes, setQueueReadyFlashes] = useState({});
  const [draftItem, setDraftItem] = useState({
    name: "",
    category: "Quick Bites",
    kind: "Veg",
    price: "119",
    description: "",
  });

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 4500);

    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    window.localStorage.setItem("canteen-theme", theme);
  }, [theme]);

  useEffect(() => {
    function syncQueueFullscreen() {
      setIsQueueFullscreen(
        document.fullscreenElement === queueBoardRef.current,
      );
    }

    document.addEventListener("fullscreenchange", syncQueueFullscreen);
    return () =>
      document.removeEventListener("fullscreenchange", syncQueueFullscreen);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    let reconnectHintTimer;

    function onOffline() {
      setIsOnline(false);
      setNetworkHint({
        tone: "warning",
        message: "You are offline. Online payment and live updates may pause.",
      });
    }

    function onOnline() {
      setIsOnline(true);
      setNetworkHint({
        tone: "success",
        message: "Back online. Refresh if live data looks stale.",
      });
      reconnectHintTimer = window.setTimeout(() => {
        setNetworkHint(null);
      }, 7000);
    }

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);

    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
      if (reconnectHintTimer) {
        window.clearTimeout(reconnectHintTimer);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(queueReadyFlashTimeoutsRef.current).forEach((timer) => {
        window.clearTimeout(timer);
      });
    };
  }, []);

  const menuMap = useMemo(
    () => Object.fromEntries(menuItems.map((item) => [item.id, item])),
    [menuItems],
  );

  const liveMenu = useMemo(
    () => menuItems.filter((item) => !item.archived),
    [menuItems],
  );

  const categories = useMemo(
    () => ["All", ...new Set(liveMenu.map((item) => item.category))],
    [liveMenu],
  );

  const filteredMenu = useMemo(() => {
    return liveMenu.filter((item) => {
      const categoryMatch =
        activeCategory === "All" || item.category === activeCategory;
      const kindMatch = activeKind === "All" || item.kind === activeKind;
      const query = searchQuery.trim().toLowerCase();
      const searchMatch =
        query.length === 0 ||
        [item.name, item.description, item.category, item.kind]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return categoryMatch && kindMatch && searchMatch;
    });
  }, [activeCategory, activeKind, liveMenu, searchQuery]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({
        ...menuMap[id],
        qty,
        lineTotal: menuMap[id].price * qty,
      }));
  }, [cart, menuMap]);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);

  const customerOrders = useMemo(
    () =>
      orders
        .filter((order) => order.customer === "Campus guest")
        .slice()
        .reverse(),
    [orders],
  );

  const activeCustomerOrder = customerOrders.find((order) =>
    ["awaiting_payment", "confirmed", "processing", "ready"].includes(
      order.orderStatus,
    ),
  );

  const pendingPayments = useMemo(
    () => orders.filter((order) => order.orderStatus === "awaiting_payment"),
    [orders],
  );

  const activeKitchenOrders = useMemo(() => {
    return orders
      .filter((order) =>
        ["confirmed", "processing", "ready"].includes(order.orderStatus),
      )
      .slice()
      .sort((first, second) => (first.token ?? 999) - (second.token ?? 999));
  }, [orders]);

  const queueOrders = useMemo(() => {
    const statusRank = {
      ready: 0,
      processing: 1,
      confirmed: 2,
    };

    return activeKitchenOrders
      .filter((order) => order.token !== null)
      .slice()
      .sort((first, second) => {
        const firstRank = statusRank[first.orderStatus] ?? 10;
        const secondRank = statusRank[second.orderStatus] ?? 10;

        if (firstRank !== secondRank) {
          return firstRank - secondRank;
        }

        return (first.token ?? 999) - (second.token ?? 999);
      });
  }, [activeKitchenOrders]);

  function showToast(message, onUndo) {
    setToast({
      id: Date.now(),
      message,
      onUndo,
    });
  }

  function undoToast() {
    if (toast?.onUndo) {
      toast.onUndo();
    }
    setToast(null);
  }

  function dismissToast() {
    setToast(null);
  }

  function dismissNetworkHint() {
    setNetworkHint(null);
  }

  function clearReadyFlash(orderId) {
    const existingTimer = queueReadyFlashTimeoutsRef.current[orderId];
    if (existingTimer) {
      window.clearTimeout(existingTimer);
      delete queueReadyFlashTimeoutsRef.current[orderId];
    }

    setQueueReadyFlashes((current) => {
      if (!current[orderId]) {
        return current;
      }

      const next = { ...current };
      delete next[orderId];
      return next;
    });
  }

  function flashReadyToken(orderId) {
    clearReadyFlash(orderId);

    setQueueReadyFlashes((current) => ({
      ...current,
      [orderId]: true,
    }));

    queueReadyFlashTimeoutsRef.current[orderId] = window.setTimeout(() => {
      clearReadyFlash(orderId);
    }, 2800);
  }

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  async function toggleQueueFullscreen() {
    if (!queueBoardRef.current) {
      return;
    }

    if (!document.fullscreenEnabled) {
      showToast("Fullscreen is not available in this browser.");
      return;
    }

    try {
      if (document.fullscreenElement === queueBoardRef.current) {
        await document.exitFullscreen();
      } else {
        await queueBoardRef.current.requestFullscreen();
      }
    } catch {
      showToast("Fullscreen could not be toggled.");
    }
  }

  function updateCart(itemId, delta) {
    setCart((current) => {
      const nextQty = Math.max(0, (current[itemId] ?? 0) + delta);
      const nextCart = { ...current, [itemId]: nextQty };
      if (nextQty === 0) {
        delete nextCart[itemId];
      }
      return nextCart;
    });

    if (paymentError) {
      setPaymentError(null);
    }
  }

  function quickOrder(itemId) {
    const item = menuMap[itemId];
    if (!item || !item.available) {
      showToast("This item is currently unavailable.");
      return;
    }

    setCart({ [itemId]: 1 });
    setPaymentError(null);
    setCartSheetOpen(true);
    showToast(`${item.name} added for quick checkout.`);
  }

  function clearCart() {
    setCart({});
    setPaymentError(null);
  }

  function toggleItemDescription(itemId) {
    setExpandedDescriptions((current) => ({
      ...current,
      [itemId]: !current[itemId],
    }));
  }

  function clearFilters() {
    setActiveCategory("All");
    setActiveKind("All");
    setSearchQuery("");
  }

  function submitOrder(mode) {
    if (cartItems.length === 0) {
      showToast("Add at least one item before placing an order.");
      return;
    }

    if (mode === "online" && !isOnline) {
      setPaymentError("Payment could not start while offline.");
      showToast("Network unavailable. Retry online payment when connected.");
      return;
    }

    const unavailableItems = cartItems.filter(
      (item) => !menuMap[item.id]?.available,
    );

    if (unavailableItems.length > 0) {
      showToast(`${unavailableItems[0].name} is unavailable right now.`);
      return;
    }

    const summary = cartItems
      .map((item) => `${item.name} x${item.qty}`)
      .join(", ");
    const orderId = `ord-${Math.floor(Date.now() / 1000)}`;
    const createdAtMs = Date.now();
    const createdAtLabel = new Date(createdAtMs).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });

    if (mode === "online") {
      const token = nextToken;
      setNextToken((current) => current + 1);
      setOrders((current) => [
        {
          id: orderId,
          token,
          customer: "Campus guest",
          summary,
          items: cartItems.map(({ id, name, qty, price }) => ({
            id,
            name,
            qty,
            price,
          })),
          orderStatus: "confirmed",
          paymentMode: "online",
          paymentStatus: "paid",
          createdAtLabel,
          createdAtMs,
          note: "Paid online",
        },
        ...current,
      ]);
      showToast(`Token #${token} created.`);
    } else {
      setOrders((current) => [
        {
          id: orderId,
          token: null,
          customer: "Campus guest",
          summary,
          items: cartItems.map(({ id, name, qty, price }) => ({
            id,
            name,
            qty,
            price,
          })),
          orderStatus: "awaiting_payment",
          paymentMode: "offline",
          paymentStatus: "pending",
          createdAtLabel,
          createdAtMs,
          note: "Waiting for counter payment",
        },
        ...current,
      ]);
      showToast("Order saved. Staff must confirm counter payment.");
    }

    setPaymentError(null);
    clearCart();
    setCartSheetOpen(false);
  }

  function placeOrder() {
    submitOrder(paymentMode);
  }

  function retryOnlinePayment() {
    submitOrder("online");
  }

  function dismissPaymentError() {
    setPaymentError(null);
  }

  function confirmOfflinePayment(orderId) {
    const previousOrder = orders.find((order) => order.id === orderId);
    if (!previousOrder) {
      return;
    }

    const token = nextToken;
    setNextToken((current) => current + 1);
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              token,
              orderStatus: "confirmed",
              paymentStatus: "paid",
              note: "Counter payment confirmed",
            }
          : order,
      ),
    );
    showToast(`Payment confirmed for token #${token}.`, () => {
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? previousOrder : order)),
      );
    });
  }

  function advanceOrder(orderId) {
    const previousOrder = orders.find((order) => order.id === orderId);
    if (!previousOrder) {
      return;
    }

    let nextStatus = previousOrder.orderStatus;
    let nextNote = previousOrder.note;

    if (previousOrder.orderStatus === "confirmed") {
      nextStatus = "processing";
      nextNote = "Kitchen started preparation";
    } else if (previousOrder.orderStatus === "processing") {
      nextStatus = "ready";
      nextNote = "Ready for pickup";
    } else if (previousOrder.orderStatus === "ready") {
      nextStatus = "completed";
      nextNote = "Collected from counter";
    }

    if (nextStatus === previousOrder.orderStatus) {
      return;
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? { ...order, orderStatus: nextStatus, note: nextNote }
          : order,
      ),
    );

    if (nextStatus === "ready") {
      flashReadyToken(orderId);
    }

    if (nextStatus === "completed") {
      clearReadyFlash(orderId);
    }

    showToast(
      `${previousOrder.token ? `Token #${previousOrder.token}` : "Order"} marked ${orderStatusLabel(nextStatus).toLowerCase()}.`,
      () => {
        setOrders((current) =>
          current.map((order) =>
            order.id === orderId ? previousOrder : order,
          ),
        );

        if (previousOrder.orderStatus === "ready") {
          flashReadyToken(orderId);
        } else {
          clearReadyFlash(orderId);
        }
      },
    );
  }

  function toggleAvailability(itemId) {
    setMenuItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, available: !item.available } : item,
      ),
    );
  }

  function toggleArchive(itemId) {
    setMenuItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, archived: !item.archived } : item,
      ),
    );
  }

  function addDraftItem(event) {
    event.preventDefault();
    if (!draftItem.name.trim()) {
      showToast("Add an item name before publishing.");
      return;
    }

    const slug = draftItem.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    setMenuItems((current) => [
      {
        id: `${slug}-${current.length + 1}`,
        name: draftItem.name.trim(),
        category: draftItem.category,
        kind: draftItem.kind,
        price: Number(draftItem.price),
        description: draftItem.description.trim() || "Freshly added special.",
        image: getMenuImage(draftItem),
        available: true,
        archived: false,
      },
      ...current,
    ]);

    setDraftItem({
      name: "",
      category: draftItem.category,
      kind: draftItem.kind,
      price: "119",
      description: "",
    });
    showToast("Special added to the menu.");
  }

  return {
    theme,
    isQueueFullscreen,
    queueBoardRef,
    menuItems,
    cart,
    paymentMode,
    activeCategory,
    activeKind,
    searchQuery,
    expandedDescriptions,
    profileOpen,
    historyOpen,
    cartSheetOpen,
    toast,
    draftItem,
    categories,
    filteredMenu,
    cartItems,
    cartTotal,
    customerOrders,
    activeCustomerOrder,
    pendingPayments,
    activeKitchenOrders,
    queueOrders,
    queueReadyFlashes,
    isOnline,
    networkHint,
    paymentError,
    setPaymentMode,
    setActiveCategory,
    setActiveKind,
    setSearchQuery,
    setProfileOpen,
    setHistoryOpen,
    setCartSheetOpen,
    setDraftItem,
    showToast,
    undoToast,
    dismissToast,
    dismissNetworkHint,
    toggleTheme,
    toggleQueueFullscreen,
    updateCart,
    quickOrder,
    clearCart,
    placeOrder,
    retryOnlinePayment,
    dismissPaymentError,
    confirmOfflinePayment,
    advanceOrder,
    toggleAvailability,
    toggleArchive,
    addDraftItem,
    toggleItemDescription,
    clearFilters,
  };
}

export default useCanteenState;

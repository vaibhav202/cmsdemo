import dashboardsData from "../mocks/dashboards.json";
import menuData from "../mocks/menu.json";
import ordersData from "../mocks/orders.json";

export const dashboards = dashboardsData;

export const viewPathMap = Object.fromEntries(
  dashboards.map((dashboard) => [dashboard.id, dashboard.path]),
);

export const pathViewMap = Object.fromEntries(
  dashboards.map((dashboard) => [dashboard.path, dashboard.id]),
);

export const baseMenu = menuData;

const demoNow = Date.now();

export const initialOrders = ordersData.map((order) => {
  const { minutesAgo = 0, ...rest } = order;
  return {
    ...rest,
    createdAtMs: demoNow - minutesAgo * 60 * 1000,
  };
});

const imageModules = import.meta.glob(
  "../assets/images/*.{jpg,jpeg,png,webp}",
  {
    eager: true,
    import: "default",
  },
);

const categoryImageKeys = {
  Rice: {
    Veg: "fried-rice-veg.jpg",
    "Non-Veg": "fried-rice-nonveg.jpg",
  },
  Noodles: {
    Veg: "noodles-veg.jpg",
    "Non-Veg": "noodles-nonveg.jpg",
  },
  Momos: {
    Veg: "momos-steamed.jpg",
    "Non-Veg": "momos-steamed.jpg",
  },
  Sandwiches: {
    Veg: "sandwich-veg.jpg",
    "Non-Veg": "sandwich-chicken.jpg",
  },
  "Quick Bites": {
    Veg: "pizza-veg.jpg",
    "Non-Veg": "burger-nonveg.jpg",
  },
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function resolveImageAsset(imageKey) {
  if (!imageKey) {
    return null;
  }

  return imageModules[`../assets/images/${imageKey}`] ?? null;
}

export function formatCurrency(value) {
  return currency.format(value).replace("₹", "₹ ");
}

export function statusTone(status) {
  if (status === "ready") {
    return "success";
  }

  if (status === "processing") {
    return "warning";
  }

  if (status === "awaiting_payment") {
    return "muted";
  }

  return "brand";
}

export function orderStatusLabel(status) {
  const labels = {
    awaiting_payment: "Awaiting payment",
    confirmed: "Confirmed",
    processing: "Processing",
    ready: "Ready",
    completed: "Completed",
    cancelled_unavailable: "Unavailable",
  };

  return labels[status] ?? status;
}

export function getMenuImage(item) {
  const fromItemKey = resolveImageAsset(item.imageKey);
  if (fromItemKey) {
    return fromItemKey;
  }

  const fallbackKey =
    categoryImageKeys[item.category]?.[item.kind] ?? "pizza-veg.jpg";
  return resolveImageAsset(fallbackKey) ?? "";
}

export function getInitialTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem("canteen-theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

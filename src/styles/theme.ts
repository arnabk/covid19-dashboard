interface Gradient {
  primary: string;
  secondary: string;
  success: string;
  danger: string;
  dark: string;
}

interface Shadow {
  card: string;
  button: string;
  chart: string;
}

interface ChartColors {
  primary: string;
  secondary: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
}

export const gradients: Gradient = {
  primary: 'from-blue-500 to-cyan-400',
  secondary: 'from-purple-500 to-pink-500',
  success: 'from-green-400 to-emerald-500',
  danger: 'from-red-500 to-orange-500',
  dark: 'from-gray-800 to-gray-900',
};

export const shadows: Shadow = {
  card: 'shadow-lg hover:shadow-xl transition-shadow duration-300',
  button: 'shadow-md hover:shadow-lg transition-all duration-300',
  chart: 'shadow-xl hover:shadow-2xl transition-all duration-300',
};

export const glassEffect = 'backdrop-blur-md bg-white/80 dark:bg-gray-900/80';

export const chartColors: ChartColors = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#06B6D4',
}; 
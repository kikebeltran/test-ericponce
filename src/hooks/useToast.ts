import toast from "react-hot-toast";

const useToast = () => {
  const successToast = (message: string) => {
    toast.success(message);
  };

  const errorToast = (message: string) => {
    toast.error(message);
  };

  return {
    successToast,
    errorToast,
  };
};

export default useToast;

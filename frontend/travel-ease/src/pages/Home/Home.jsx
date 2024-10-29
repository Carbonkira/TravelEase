import React, { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { MdAdd } from "react-icons/md";
import Modal from 'react-modal';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TravelPlanCard from '../../components/Cards/TravelPlanCard';
import AddEditTravelPlan from './AddEditTravelPlan';
import ViewTravelPlan from './ViewTravelPlan';
import EmptyCard from '../../components/Cards/EmptyCard';
import EmptyImg from '../../assets/images/add-story.svg'


Modal.setAppElement('#root');

const Home = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [allPlans, setAllPlans] = useState([]);

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [openViewModal, setOpenViewModal] = useState({
    isShown: false,
    data: null,
  });

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  const getAllPlans = async () => {
    try {
      const response = await axiosInstance.get("/get-all-plans");
      if (response.data && response.data.plans) {
        setAllPlans(response.data.plans);
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.");
    }
  };

  const handleEdit = (data) => {
    setOpenAddEditModal({ isShown: true, type: "edit", data: data });
  };

  const handleViewPlan = (data)  => {
    setOpenViewModal({ isShown:true, data});
  };

  const handleIsFavorite = async (planData) => {
    const planId = planData._id;
    try {
      const response = await axiosInstance.put(
        `/update-is-favorite/${planId}`,
        { isFavorite: !planData.isFavorite }
      );
      if (response.data && response.data.plan) {
        toast.success("Plan Updated Successfully");
        getAllPlans();
      }
    } catch (error) {
      console.log("An unexpected error has occurred. Please try again.");
    }
  };

  const deleteTravelPlan = async (data) => {
    const planId = data._id;

    try {
      const response = await axiosInstance.delete(`/delete-plan/${planId}`);
      if (response.data && !response.data.error) {
        toast.error("Plan Deleted Successfully");
        setOpenViewModal((prevState) => ({ ...prevState, isShown: false }));
        getAllPlans(); 
      } else {
        throw new Error("Failed to delete plan.");
      }
    } catch (error) {
      console.error("Delete Plan Error:", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  useEffect(() => {
    getUserInfo();
    getAllPlans();
  }, []);

  return (
    <>
      <NavBar userInfo={userInfo} />
      <div className='container mx-auto py-10'>
        <div className='flex gap-7'>
          <div className='flex-1'>
            {allPlans.length > 0 ? (
              <div className='grid grid-cols-2 gap-4'>
                {allPlans.map((item) => (
                  <TravelPlanCard
                    key={item._id}
                    imgUrl={item.imageUrl}
                    title={item.title}
                    plan={item.plan}
                    date={item.plannedDate}
                    plannedLocation={item.plannedLocation}
                    isFavorite={item.isFavorite}
                    onEdit={() => handleEdit(item)}
                    onClick={() => handleViewPlan(item)}
                    onFavoriteClick={() => handleIsFavorite(item)}
                  />
                ))}
              </div>
            ) : (
              <EmptyCard imgSrc={EmptyImg} message={`Start planning your travel adventure! Click the 'Add' button to get started!`}/>
            )}
          </div>
          <div className='w-[320px]'></div>
        </div>
      </div>

      {/* Add and Edit Modal */}
      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => setOpenAddEditModal({ isShown: false, type: "add", data: null })}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 999,
          },
        }}
        className="modal-box"
      >
        <AddEditTravelPlan
          type={openAddEditModal.type}
          planInfo={openAddEditModal.data}
          onClose={() => setOpenAddEditModal({ isShown: false, type: "add", data: null })}
          getAllTravelPlans={getAllPlans} // Pass getAllPlans to refresh on add/edit
        />
      </Modal>

      {/* View travel Plan */}
      <Modal
        isOpen={openViewModal.isShown}
        onRequestClose={() => setOpenAddEditModal({ isShown: false, type: "add", data: null })}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 999,
          },
        }}
        className="modal-box"
      >
        <ViewTravelPlan
          planInfo={openViewModal.data || null}
          onClose={() => {
            setOpenViewModal((prevState) => ({ ...prevState, isShown: false }));
          }}
          onEditClick={() => {
            setOpenViewModal((prevState) => ({ ...prevState, isShown: false }));
            handleEdit(openViewModal.data || null);
          }}
          onDeleteClick={() => {
            deleteTravelPlan(openViewModal.data || null);
          }}
        />
      </Modal>

      <button
        className='w-16 h-16 flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-200 fixed right-10 bottom-10'
        onClick={() => {
          setOpenAddEditModal({ isShown: true, type: "add", data: null });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <ToastContainer />
    </>
  );
};

export default Home;

import React, { useState } from 'react';
import { MdAdd, MdDeleteOutline, MdUpdate, MdClose } from "react-icons/md";
import DateSelector from "../../components/input/DateSelector"
import ImageSelector from '../../components/input/ImageSelector';
import TagInput from '../../components/input/TagInput';
import axiosInstance from "../../utils/axiosInstance";
import moment from "moment";
import uploadImage from "../../utils/uploadImage";
import { toast } from "react-toastify";
const AddEditTravelPlan = ({
    planInfo,
    type,
    onClose,
    getAllTravelPlans = () => {} ,
}) => {

    const [title,setTitle] = useState(planInfo?.title || "");
    const [planImg,setPlanImg] = useState(planInfo?.imageUrl ||null);
    const [plan,setplan] = useState(planInfo?.plan ||"");
    const [plannedLocation,setplannedLocation] = useState(planInfo?.plannedLocation ||[]);
    const [plannedDate, setPlannedDate] = useState(planInfo?.plannedDate ||null);

    const [error,setError] = useState("");


    //Add Travel Story
    const addNewTravelPlan = async () => {
        try{
            let imageUrl = "";

            // Upload image if present
            if (planImg) {
                const imgUploadRes = await uploadImage(planImg);
                // Get image URL
                imageUrl = imgUploadRes.imageUrl || "";
            }
            
            const response = await axiosInstance.post("/add-travel-plan", {
                title,
                plan,
                imageUrl: imageUrl || "",
                plannedLocation,
                plannedDate: plannedDate
                    ? moment(plannedDate).valueOf()
                    : moment().valueOf(),
            });
            
            if (response.data && response.data.plan) {
                toast.success("Plan Added Successfully");
                // Refresh plans
                getAllTravelPlans();
                // Close modal or form
                onClose();
            }
        } catch (error) {
            if (error.response && 
                error.response.data && 
                error.response.data.message) {
                setError(error.response.data.message);
            } else {
                // Handle unexpected errors
                setError("An unexpected error occurred. Please try again.");
            }
        }   
        
    };

    const updateTravelPlan = async () => {
        console.log("Checking getAllTravelPlans:", getAllTravelPlans); // Add this line for debugging
        const planId = planInfo._id;
    
        try {
            let imageUrl = planInfo.imageUrl || ""; // Set default to existing imageUrl
            let postData = {
                title,
                plan,
                imageUrl,
                plannedLocation,
                plannedDate: plannedDate ? moment(plannedDate).valueOf() : moment().valueOf(),
            };
    
            if (typeof planImg === "object") {
                // Upload new image if planImg is a File object
                const imgUploadRes = await uploadImage(planImg);
                imageUrl = imgUploadRes.imageUrl || "";
    
                // Update postData with new imageUrl
                postData = {
                    ...postData,
                    imageUrl: imageUrl,
                };
            }
    
            const response = await axiosInstance.put(`/edit-plan/${planId}`, postData);
    
            // Check if the plan was successfully updated
            if (response.data && response.data.plan) {
                toast.success("Plan Updated Successfully");
                getAllTravelPlans();
                onClose();
            } else {
                throw new Error("Unexpected response structure"); // Handle if response structure is not as expected
            }
        } catch (error) {
            console.error("Update Error:", error); // Log the error for debugging
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else if (error.message) {
                setError(error.message); // Use specific error message if available
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        }
    };

    

    const handleAddorUpdateClick = async() => {
        console.log("Input Data:", {title,planImg,plannedLocation,plannedDate})
        if (!title) {
            setError("Please enter the title");
            return;
        }
        
        if (!plan) {
            setError("Please enter the plan");
            return;
        }
        
        setError("");
        
        if (type === "edit") {
            updateTravelPlan();
        } else {
            addNewTravelPlan();
        }
    };


    // Delete Story Image and Update the Story
    const handleDeleteImg = async () => {
        try {
            // Deleting the image
            const deleteImgRes = await axiosInstance.delete("/delete-image", {
                params: {
                    imageUrl: planInfo.imageUrl,
                },
            });
    
            if (deleteImgRes.data) {
                const planId = planInfo._id;
    
                const postData = {
                    title,
                    plan,
                    plannedLocation,
                    plannedDate: plannedDate ? moment(plannedDate).valueOf() : moment().valueOf(),
                    imageUrl: "", // Clear image URL after deletion
                };
    
                // Updating plan
                const response = await axiosInstance.put(
                    "/edit-plan/" + planId,
                    postData
                );
    
                if (response.data && response.data.plan) {
                    toast.success("Image Deleted and Plan Updated Successfully");
                    setPlanImg(null); // Clear local state for image
                    getAllTravelPlans(); // Refresh the travel plans list
                }
            }
        } catch (error) {
            console.error("Delete Image Error:", error);
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        }
    };







    return (
        <div className='relative'>
            <div className='flex items-center justify-between'>
                <h5 className='text-xl font-medium text-slate-700'>
                    {type === "add" ? "Add Plan" : "Update Plan"}
                </h5>

                <div>
                    <div className='flex items-center gap-3 bg-orange-50/50 p-2 rounded-l-lg'>
                        {type === "add" ? (
                            <button className='btn-small' onClick={handleAddorUpdateClick}>
                                <MdAdd className="text-lg" /> ADD PLAN
                            </button>
                        ) : (
                            <>
                                <button className='btn-small' onClick={handleAddorUpdateClick}>
                                    <MdUpdate className="text-lg" /> UPDATE PLAN
                                </button>
                            </>
                        )}

                        <button className='' onClick={onClose}>
                            <MdClose className="text-xl text-slate-400" />
                        </button>
                    </div>
                    
                    {error && (
                        <p className='text-red-500 text-xs pt-2 text-right'>{error}</p>
                    )}
                </div>
            </div>


            <div>
                <div className="flex-1 flex flex-col gap-2 pt-4">
                <label className="input-label">TITLE</label>
                <input
                    type="text"
                    className="text-2xl text-slate-950 outline-none"
                    placeholder="My Future Gateaway Plan"
                    value={title}
                    onChange={({target})=> setTitle(target.value)}
                />

                <div className='my-3'>
                    <DateSelector date={plannedDate} setDate={setPlannedDate}/>
                </div>


                <ImageSelector image={planImg} setImage={setPlanImg} handleDeleteImg={handleDeleteImg}/>

                <div className='flex flex-col gap-2 mt-4'>
                <label className='input-label'>PLAN</label>
                <textarea
                    type="text"
                    className="text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded"
                    placeholder="Your Plan"
                    rows={10}
                    value={plan}
                    onChange={({ target }) => setplan(target.value)}
                />
                </div>

                <div className="pt-3">
                    <label className="input-label">SET LOCATIONS</label>
                    <TagInput tags={plannedLocation} setTags={setplannedLocation} />
                </div>

                </div>
            </div>
        </div>
    );
};

export default AddEditTravelPlan;

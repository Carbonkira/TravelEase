import React from "react";
import moment from "moment";
import { MdAdd, MdDeleteOutline, MdUpdate, MdClose } from "react-icons/md";

import { GrMapLocation } from "react-icons/gr";

const ViewTravelPlan = ({ planInfo, onClose, onEditClick, onDeleteClick }) => {
    return (
        <div className="relative">
            <div className="flex items-center justify-end">
                <div className="flex items-center gap-3 bg-orange-50/50 p-2 rounded-l-lg">
                    <button className="btn-small" onClick={onEditClick}>
                        <MdUpdate className="text-lg" /> UPDATE PLAN
                    </button>
                    <button className="btn-small btn-delete" onClick={onDeleteClick}>
                        <MdDeleteOutline className="text-lg" /> Delete
                    </button>
                    <button className="" onClick={onClose}>
                        <MdClose className="text-xl text-slate-400" />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-2 py-4">
                <h1 className="text-2xl text-slate-950">
                    {planInfo && planInfo.title}
                </h1>
            <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                    {planInfo && moment(planInfo.plannedDate).format("Do MMM YYYY")}
                </span>
            <div className="inline-flex items-center gap-2 text-[13px] text-orange-600 bg-orange-200/40 rounded px-2 py-1">
                <GrMapLocation className="text-sm" />
                {planInfo && planInfo.plannedLocation.map((item, index) => planInfo.plannedLocation.lenght == index+1 ? `${item}` : `${item}`)}
            </div>
            </div>
            

            <img
            src={planInfo && planInfo.imageUrl}
            alt="Selected"
            className="w-full h-[300px] object-cover rounded-lg"
            />

            <div className="mt-4">
                <p className="text-sm text-slate-950 leading-6 text-justify whitespace-pre-line">{planInfo.plan}</p>
            </div>
        </div>
        </div>
    );
};

export default ViewTravelPlan;

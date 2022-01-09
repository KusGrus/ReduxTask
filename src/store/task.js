import {createSlice} from "@reduxjs/toolkit";
import todosService from "../services/todos.service";
import {setError} from "./errors";
import {v4 as uuid} from 'uuid';

const initialState = {entities: [], isLoading: true};

const taskSlice = createSlice({
    name: "task",
    initialState,
    reducers: {
        received(state, action) {
            state.entities = action.payload;
            state.isLoading = false;
        },
        update(state, action) {
            const elementIndex = state.entities.findIndex(
                (el) => el.id === action.payload.id
            );
            state.entities[elementIndex] = {
                ...state.entities[elementIndex],
                ...action.payload,
            };
        },
        remove(state, action) {
            state.entities = state.entities.filter(el => el.id !== action.payload.id);
        },
        add(state, action) {
            action.payload.id = uuid()
            state.entities.unshift(action.payload)
        },
        taskRequested(state) {
            state.isLoading = true;
        },
        taskRequestFailed(state) {
            state.isLoading = false;
        },
    },
});
const {actions, reducer: taskReducer} = taskSlice;
const {update, remove, received, add, taskRequested, taskRequestFailed} = actions;

export const loadTasks = () => async dispatch => {
    dispatch(taskRequested());
    try {
        const data = await todosService.fetch();
        dispatch(received(data));
    } catch (error) {
        dispatch(taskRequestFailed());
        dispatch(setError(error.message));
    }
};

export const addTask = (body) => async dispatch => {
    try {
        const data = await todosService.add(body);
        dispatch(add(data));
    } catch (error) {
        dispatch(taskRequestFailed());
        dispatch(setError(error.message));
    }
};

export const completeTask = id => dispatch => dispatch(update({id, completed: true}));
export const titleChanged = id => update({id, title: `New title for ${id}`});
export const taskDeleted = id => remove({id});

export const getTasks = () => state => state.tasks.entities;
export const getTasksLoadingStatus = () => state => state.tasks.isLoading;

export default taskReducer;

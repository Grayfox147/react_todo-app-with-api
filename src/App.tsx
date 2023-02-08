/* eslint-disable max-len */
/* eslint-disable jsx-a11y/control-has-associated-label */

import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import {
  getTodos,
  patchTodo,
  postTodo,
  removeTodo,
} from './api/todos';
import { Footer } from './components/Footer';
import { Form } from './components/Form';
import { TodoList } from './components/TodoList';
import { Errors, Filter, Todo } from './types/Todo';
import { UserWarning } from './UserWarning';

const USER_ID = 6101;

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [isItError, setIsItError] = useState(false);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    getTodos(USER_ID)
      .then((data) => {
        setTodos(data);
        setError('');
      })
      .catch(() => {
        setIsItError(true);
        setError(Errors.LOADING);
      })
      .finally(() => {
        setTimeout(() => {
          setIsItError(false);
        }, 3000);
      });
  }, [isReloading]);

  const handleAddTodo = (todo: Todo) => {
    if (!todo.title) {
      setError(Errors.TITLE);
      setIsItError(true);

      setTimeout(() => {
        setIsItError(false);
      }, 3000);

      return;
    }

    setTempTodo(todo);

    postTodo(todo)
      .then(() => (
        setTimeout(() => {
          setTodos([...todos, todo]);
          setTempTodo(null);
        }, 3000)
      ))
      .catch(() => {
        setError(Errors.ADDING);
        setIsItError(true);

        setTimeout(() => {
          setIsItError(false);
        }, 3000);
      });
  };

  const handleRemoveTodo = (todoId: number) => {
    removeTodo(todoId)
      .then(() => {
        const filteredTodos = todos.filter((todo) => todo.id !== todoId);

        setTodos(filteredTodos);
      })
      .catch(() => {
        setError(Errors.REMOVING);
        setIsItError(true);

        setTimeout(() => {
          setIsItError(false);
        }, 3000);
      });
  };

  const handleUpdateTodo = (updatedTodo: Todo) => {
    patchTodo(updatedTodo.id, updatedTodo)
      .then(() => {
        setTodos(todos);
        setTimeout(() => {
          setIsReloading(true);
        }, 300);
      })
      .catch(() => {
        setError(Errors.UPDATING);
        setIsItError(true);

        setTimeout(() => {
          setIsItError(false);
        }, 3000);
      })

      .finally(() => (
        setIsReloading(false)
      ));
  };

  // const handleClear = (todoIds: number[]) => {
  //   todoIds.map((id) => {
  //     return handleRemoveTodo(id);
  //   });
  // };

  const handleClearTodos = async (todoIds: number[]) => {
    try {
      await Promise.all(todoIds.map((id) => handleRemoveTodo(id)));
    } catch (mistake) {
      setError(Errors.REMOVING);
    }
  };

  const handleStatusUpdate = (todoToUpdate: Todo) => {
    const updatedTodo = { ...todoToUpdate, completed: !todoToUpdate.completed };

    handleUpdateTodo(updatedTodo);
  };

  const handleToggleAll = () => {
    todos.forEach((todo) => {
      if (!todo.completed) {
        handleStatusUpdate(todo);
      }

      if (todos.every((element) => element.completed)) {
        todos.forEach((item) => handleStatusUpdate(item));
      }
    });
  };

  const visibleTodos = todos
    .filter((todo) => {
      switch (filter) {
        case Filter.ACTIVE:
          return !todo.completed;
        case Filter.COMPLETED:
          return todo.completed;
        default:
          return true;
      }
    });

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          <button
            type="button"
            className={classNames(
              'todoapp__toggle-all',
              { active: todos.some((todo) => !todo.completed) },
            )}
            onClick={handleToggleAll}
          />
          <Form
            onSubmit={handleAddTodo}
            todos={todos}
            className="todoapp__new-todo"
            placeholder="What needs to be done?"
            userId={USER_ID}
          />
        </header>
        {todos && (
          <>
            <TodoList
              userId={USER_ID}
              onRemove={handleRemoveTodo}
              todos={visibleTodos}
              onTodoUpdate={handleUpdateTodo}
              handleStatusUpdate={handleStatusUpdate}
            />
            {tempTodo && (
              <div
                id="0"
                key={tempTodo.id}
                className={classNames(
                  'todo',
                  { completed: tempTodo.completed },
                )}
              >
                <label
                  className="todo__status-label"
                >
                  <input
                    type="checkbox"
                    className="todo__status"
                    checked={tempTodo.completed}
                  />
                </label>
                <span
                  className="todo__title"
                >
                  {tempTodo.title}
                </span>
                <button
                  type="button"
                  className="todo__remove"
                >
                  ×
                </button>
                <div className="loader" />
              </div>
            )}
            <Footer
              todos={todos}
              filter={filter}
              onSetFilter={setFilter}
              onSetClearHandler={handleClearTodos}
            />
          </>
        )}
        {isItError && (
          <div
            className={classNames(
              'notification is-danger is-light has-text-weight-normal',
              { hidden: !isItError },
            )}
          >
            <button
              type="button"
              className="delete"
              onClick={() => {
                setIsItError(false);
              }}
            />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

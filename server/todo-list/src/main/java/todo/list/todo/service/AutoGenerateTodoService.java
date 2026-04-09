package todo.list.todo.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import todo.list.todo.dto.request.AiTaskSuggestion;
import todo.list.todo.dto.request.AutoGenerateRequest;
import todo.list.todo.dto.request.NlpRequest;
import todo.list.todo.dto.response.TodoResponse;
import todo.list.todo.entity.Todo;
import todo.list.todo.entity.enums.PriorityEnum;
import todo.list.todo.entity.enums.StatusEnum;
import todo.list.todo.service.ai.NlpServiceClient;
import todo.list.user.entity.User;
import org.eclipse.microprofile.rest.client.inject.RestClient;


import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class AutoGenerateTodoService {

    @Inject
    TodoSupportService todoSupportService;

    @Inject
    TodoService todoService;

    @Inject
    @RestClient
    NlpServiceClient nlpServiceClient;

    @Transactional
    public List<TodoResponse> autoGenerate(AutoGenerateRequest request, String userEmail) throws Exception {
        //Nhan prompt
        List<TodoResponse> rs = new ArrayList<>();
        User user = todoSupportService.findUserByEmail(userEmail);
        //Tu dong tao task
//        List<AiTaskSuggestion> result = callMockAi(request.getPrompt(), request.getMaxTasks());
        List<AiTaskSuggestion> result = nlpServiceClient.extract(new NlpRequest(request.getPrompt(), request.getMaxTasks()));

        for(AiTaskSuggestion suggestion : result){
            Todo todo = new Todo();
            todo.user = user;

//            ZoneId zoneVN = ZoneId.of("Asia/Ho_Chi_Minh");

            Instant dueDate = suggestion.getDueDate() != null
                    ? LocalDateTime.parse(suggestion.getDueDate()).atZone(ZoneId.of("Asia/Ho_Chi_Minh")).toInstant()
                    : Instant.now().plus(1, ChronoUnit.DAYS);

//            Instant dueDate = suggestion.getDueDate() != null
//                    ? LocalDateTime.parse(suggestion.getDueDate())
//                    : LocalDateTime.now().plusDays(1).withHour(9).withMinute(0);

            PriorityEnum priorityEnum = suggestion.getPriority() != null ? suggestion.getPriority() : PriorityEnum.MEDIUM;

            todoSupportService.setTodoFields(todo, suggestion.getTitle(), suggestion.getDescription(), dueDate,
                    priorityEnum, StatusEnum.PENDING);

            //Luu task
            todoService.saveTodo(todo); 


            rs.add(todoSupportService.mapTodoResponse(todo));

        }
        //return task
        return rs;
    }


    //===============Hàm thay thế cho thuật toán AI sau này sẽ phát triển
//    private List<AiTaskSuggestion> callMockAi(String prompt, int maxTasks){
//        ArrayList<AiTaskSuggestion> result = new ArrayList<>();
//        String[] parts = prompt.split(",");
//        LocalDate today = LocalDate.now();
//
//        int count = Math.min(parts.length, maxTasks);
//
//
//        for (int i = 0; i < count; i++) {
//            AiTaskSuggestion suggestion = new AiTaskSuggestion();
//
//            String taskContent = parts[i].trim();
//            if (taskContent.isEmpty()) continue;
//
//
//            suggestion.setTitle("Task Ngày: " + today);
//            suggestion.setPriority(PriorityEnum.MEDIUM);
//            suggestion.setDueDate(Instant.now().plus(1, ChronoUnit.DAYS));
//            suggestion.setDescription(taskContent);
//            result.add(suggestion);
//
//        }
//
//        return result;
//    }
}

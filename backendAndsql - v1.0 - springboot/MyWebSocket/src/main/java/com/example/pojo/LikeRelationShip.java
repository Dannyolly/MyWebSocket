package com.example.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LikeRelationShip {
    private Integer id;

    private Integer postId;

    private Integer userId;

    private Date likeDate;


}
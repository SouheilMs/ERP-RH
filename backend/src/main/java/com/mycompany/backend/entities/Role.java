package com.mycompany.backend.entities;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Getter
@Setter
@Document(collection = "roles")
public class Role {
  @Id
  private String id;

  @Field("name")
  private ERole name;

  public Role() {
  }

  public Role(ERole name) {
    this.name = name;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public void setName(ERole name) {
    this.name = name;
  }

  public ERole getName() {
    return name;
  }

  // Add this method to fix the role name issue
  public String getRoleName() {
    return name != null ? name.name() : null;
  }
}